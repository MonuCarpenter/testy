import { NextRequest, NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import Test from "@/models/Test";
import Result from "@/models/Result";
import User from "@/models/User";
import { getChatResponse, StudentContext } from "@/lib/gemini";

// Rate limiting - simple in-memory store (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_HOUR = 50;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + 60 * 60 * 1000, // 1 hour
    });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  userLimit.count++;
  return true;
}

async function buildStudentContext(studentId: string): Promise<StudentContext> {
  // Get student info
  const student = await User.findById(studentId).select("name").lean();
  const studentName = (student as any)?.name || "Student";

  // Get all tests assigned to this student
  const assignedTests = await Test.find({
    assignedStudents: studentId,
  })
    .select("_id title subject totalQuestions")
    .lean();

  const testIds = assignedTests.map((t) => t._id);

  // Get all results for this student
  const allResults = await Result.find({
    student: studentId,
    test: { $in: testIds },
  })
    .populate("test", "title subject")
    .lean();

  const completedResults = allResults.filter((r) => r.testCompleted);

  // Calculate statistics
  const totalTests = assignedTests.length;
  const completedTests = completedResults.length;
  const avgScore =
    completedResults.length > 0
      ? Math.round(
          completedResults.reduce((sum, r) => sum + r.percentage, 0) /
            completedResults.length
        )
      : 0;
  const highestScore =
    completedResults.length > 0
      ? Math.max(...completedResults.map((r) => r.percentage))
      : 0;
  const lowestScore =
    completedResults.length > 0
      ? Math.min(...completedResults.map((r) => r.percentage))
      : 0;

  // Recent tests (last 10)
  const recentTests = completedResults
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    .slice(0, 10)
    .map((r) => ({
      title: r.test.title,
      subject: r.test.subject,
      score: r.percentage,
      date: r.submittedAt.toISOString(),
      correctAnswers: r.correctAnswers,
      totalQuestions: r.totalQuestions,
    }));

  // Subject-wise performance
  const subjectPerformance = new Map();
  completedResults.forEach((result) => {
    const subject = result.test.subject;
    if (!subjectPerformance.has(subject)) {
      subjectPerformance.set(subject, {
        subject,
        totalTests: 0,
        totalScore: 0,
      });
    }
    const data = subjectPerformance.get(subject);
    data.totalTests += 1;
    data.totalScore += result.percentage;
  });

  const subjectStats = Array.from(subjectPerformance.values()).map((data) => ({
    subject: data.subject,
    tests: data.totalTests,
    avgScore: Math.round(data.totalScore / data.totalTests),
  }));

  // Find strongest and weakest subjects
  let strongestSubject = null;
  let weakestSubject = null;
  if (subjectStats.length > 0) {
    strongestSubject = subjectStats.reduce((max, current) =>
      current.avgScore > max.avgScore ? current : max
    ).subject;
    weakestSubject = subjectStats.reduce((min, current) =>
      current.avgScore < min.avgScore ? current : min
    ).subject;
  }

  return {
    studentName: studentName,
    totalTests,
    completedTests,
    averageScore: avgScore,
    highestScore,
    lowestScore,
    strongestSubject,
    weakestSubject,
    recentTests,
    subjectStats,
  };
}

export async function POST(request: NextRequest) {
  const auth = await getAuthOrThrow(["student"]);
  if ("error" in auth) return auth.error;

  try {
    // Check rate limit
    if (!checkRateLimit(auth.user.id)) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. You can send up to 50 messages per hour. Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, chatHistory } = body;

    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message is too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Build student context
    const context = await buildStudentContext(auth.user.id);

    // Get AI response
    const aiResponse = await getChatResponse(
      context,
      message,
      chatHistory || []
    );

    return NextResponse.json({
      response: aiResponse,
      context: {
        totalTests: context.totalTests,
        completedTests: context.completedTests,
        averageScore: context.averageScore,
        strongestSubject: context.strongestSubject,
        weakestSubject: context.weakestSubject,
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to process your message. Please try again later.",
      },
      { status: 500 }
    );
  }
}

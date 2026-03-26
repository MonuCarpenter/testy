import { NextRequest, NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import { getChatResponse } from "@/lib/gemini";
import {
  buildTeacherContext,
  buildTeacherSystemPrompt,
  TeacherContext,
} from "@/lib/teacher-chat-context";

// Rate limiting - simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_HOUR = 60;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + 60 * 60 * 1000,
    });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;

  try {
    if (!checkRateLimit(auth.user.id)) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. You can send up to 60 messages per hour. Please try again later.",
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

    // Build teacher context
    const context = await buildTeacherContext(auth.user.id);

    // Create a modified context that matches StudentContext interface
    const modifiedContext = {
      studentName: context.teacherName,
      totalTests: context.totalTests,
      completedTests: context.totalTests,
      averageScore: context.classStats.averageScore,
      highestScore: context.classStats.highestScore,
      lowestScore: context.classStats.lowestScore,
      strongestSubject:
        context.subjectPerformance.length > 0
          ? context.subjectPerformance.reduce((max, curr) =>
              curr.avgScore > max.avgScore ? curr : max
            ).subject
          : null,
      weakestSubject:
        context.subjectPerformance.length > 0
          ? context.subjectPerformance.reduce((min, curr) =>
              curr.avgScore < min.avgScore ? curr : min
            ).subject
          : null,
      recentTests: context.recentTests.map((t) => ({
        title: t.title,
        subject: t.subject,
        score: t.avgScore,
        date: t.date,
        correctAnswers: 0,
        totalQuestions: 0,
      })),
      subjectStats: context.subjectPerformance.map((s) => ({
        subject: s.subject,
        avgScore: s.avgScore,
        tests: s.totalTests,
      })),
    };

    // Get AI response with custom system prompt
    const systemPrompt = buildTeacherSystemPrompt(context);

    // We'll use the same getChatResponse but with modified context and custom prompt
    const aiResponse = await getChatResponse(
      modifiedContext,
      message,
      chatHistory || [],
      systemPrompt
    );

    return NextResponse.json({
      response: aiResponse,
      context: {
        totalTests: context.totalTests,
        totalStudents: context.totalStudents,
        averageScore: context.classStats.averageScore,
        passRate: context.classStats.passRate,
        studentsNeedingHelp: context.studentsNeedingHelp.length,
        performanceBrackets: context.performanceBrackets,
      },
    });
  } catch (error: any) {
    console.error("Teacher chat API error:", error);
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

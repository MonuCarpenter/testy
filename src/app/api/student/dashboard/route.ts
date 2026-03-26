import { NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import Test from "@/models/Test";
import Result from "@/models/Result";

export async function GET() {
  const auth = await getAuthOrThrow(["student"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();

    const studentId = auth.user.id;

    // Get all tests assigned to this student
    const assignedTests = await Test.find({
      assignedStudents: studentId,
    })
      .select("_id title subject durationMinutes totalQuestions createdAt")
      .lean();

    const testIds = assignedTests.map((t) => t._id);

    // Get all results for this student
    const allResults = await Result.find({
      student: studentId,
      test: { $in: testIds },
    })
      .populate("test", "title subject")
      .lean();

    // Separate completed and pending tests
    const completedTestIds = allResults
      .filter((r) => r.testCompleted)
      .map((r) => r.test._id.toString());

    const completedResults = allResults.filter((r) => r.testCompleted);
    const pendingTests = assignedTests.filter(
      (t) => !completedTestIds.includes((t._id as any).toString())
    );

    // Calculate statistics
    const totalAssigned = assignedTests.length;
    const totalCompleted = completedResults.length;
    const totalPending = pendingTests.length;

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

    // Performance trend (last 10 tests)
    const performanceTrend = completedResults
      .sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      )
      .slice(-10)
      .map((r, index) => ({
        test: `Test ${index + 1}`,
        score: r.percentage,
        title: r.test.title,
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
          avgScore: 0,
        });
      }
      const data = subjectPerformance.get(subject);
      data.totalTests += 1;
      data.totalScore += result.percentage;
    });

    const subjectStats = Array.from(subjectPerformance.values()).map(
      (data) => ({
        subject: data.subject,
        tests: data.totalTests,
        avgScore: Math.round(data.totalScore / data.totalTests),
      })
    );

    // Score distribution
    const scoreDistribution = [
      {
        range: "90-100%",
        count: completedResults.filter((r) => r.percentage >= 90).length,
      },
      {
        range: "75-89%",
        count: completedResults.filter(
          (r) => r.percentage >= 75 && r.percentage < 90
        ).length,
      },
      {
        range: "60-74%",
        count: completedResults.filter(
          (r) => r.percentage >= 60 && r.percentage < 75
        ).length,
      },
      {
        range: "Below 60%",
        count: completedResults.filter((r) => r.percentage < 60).length,
      },
    ];

    // Recent test results (last 5)
    const recentResults = completedResults
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
      .slice(0, 5)
      .map((r) => ({
        _id: r._id,
        testTitle: r.test.title,
        subject: r.test.subject,
        score: r.percentage,
        correctAnswers: r.correctAnswers,
        totalQuestions: r.totalQuestions,
        submittedAt: r.submittedAt,
      }));

    // Upcoming/Pending tests (next 5)
    const upcomingTests = pendingTests.slice(0, 5).map((t) => ({
      _id: t._id,
      title: t.title,
      subject: t.subject,
      durationMinutes: t.durationMinutes,
      totalQuestions: t.totalQuestions,
    }));

    // Study recommendation based on lowest performing subject
    let weakestSubject = null;
    if (subjectStats.length > 0) {
      weakestSubject = subjectStats.reduce((min, current) =>
        current.avgScore < min.avgScore ? current : min
      );
    }

    return NextResponse.json({
      summary: {
        totalAssigned,
        totalCompleted,
        totalPending,
        avgScore,
        highestScore,
        lowestScore,
        completionRate:
          totalAssigned > 0
            ? Math.round((totalCompleted / totalAssigned) * 100)
            : 0,
      },
      performanceTrend,
      subjectStats,
      scoreDistribution,
      recentResults,
      upcomingTests,
      weakestSubject,
    });
  } catch (error: any) {
    console.error("Student dashboard error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

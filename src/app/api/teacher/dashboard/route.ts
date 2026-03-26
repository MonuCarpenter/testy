import { NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import Test from "@/models/Test";
import Result from "@/models/Result";
import User from "@/models/User";

export async function GET() {
  const auth = await getAuthOrThrow(["teacher"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();

    // Get all tests created by this teacher
    const tests = await Test.find({ teacher: auth.user.id }).lean();
    const testIds = tests.map((t) => t._id);

    // Get all results for teacher's tests
    const results = await Result.find({ test: { $in: testIds } })
      .populate("student", "name email")
      .populate("test", "title subject")
      .lean();

    // Get unique subjects
    const subjects = [...new Set(tests.map((t) => t.subject))];

    // Calculate total students assigned (unique students across all tests)
    const uniqueStudents = new Set();
    tests.forEach((test) => {
      if (test.assignedStudents) {
        test.assignedStudents.forEach((studentId: any) => {
          uniqueStudents.add(studentId.toString());
        });
      }
    });

    // Calculate average result percentage
    const completedResults = results.filter((r) => r.testCompleted);
    const avgPercentage =
      completedResults.length > 0
        ? Math.round(
            completedResults.reduce((sum, r) => sum + r.percentage, 0) /
              completedResults.length
          )
        : 0;

    // Get recent tests (last 5)
    const recentTests = tests
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((test) => {
        const testIdStr = test._id.toString();
        return {
          _id: test._id,
          title: test.title,
          subject: test.subject,
          createdAt: test.createdAt,
          assignedCount: test.assignedStudents?.length || 0,
          completedCount: results.filter(
            (r: any) => r.test._id.toString() === testIdStr && r.testCompleted
          ).length,
        };
      });

    // Subject-wise test distribution
    const subjectDistribution = subjects.map((subject) => ({
      subject,
      count: tests.filter((t) => t.subject === subject).length,
    }));

    // Monthly test creation trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const testsInMonth = tests.filter((t) => {
        const createdDate = new Date(t.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;

      monthlyTrend.push({
        month: `${monthName} ${year}`,
        tests: testsInMonth,
      });
    }

    // Performance distribution (grade ranges)
    const performanceDistribution = [
      {
        grade: "90-100%",
        count: completedResults.filter((r) => r.percentage >= 90).length,
      },
      {
        grade: "75-89%",
        count: completedResults.filter(
          (r) => r.percentage >= 75 && r.percentage < 90
        ).length,
      },
      {
        grade: "60-74%",
        count: completedResults.filter(
          (r) => r.percentage >= 60 && r.percentage < 75
        ).length,
      },
      {
        grade: "50-59%",
        count: completedResults.filter(
          (r) => r.percentage >= 50 && r.percentage < 60
        ).length,
      },
      {
        grade: "Below 50%",
        count: completedResults.filter((r) => r.percentage < 50).length,
      },
    ];

    // Test completion rate
    const totalAssignments = tests.reduce(
      (sum, test) => sum + (test.assignedStudents?.length || 0),
      0
    );
    const completionRate =
      totalAssignments > 0
        ? Math.round((completedResults.length / totalAssignments) * 100)
        : 0;

    // Top performing students (top 5)
    const studentPerformance = new Map();
    completedResults.forEach((result: any) => {
      const studentId = result.student._id.toString();
      if (!studentPerformance.has(studentId)) {
        studentPerformance.set(studentId, {
          student: result.student,
          totalTests: 0,
          totalPercentage: 0,
        });
      }
      const data = studentPerformance.get(studentId);
      data.totalTests += 1;
      data.totalPercentage += result.percentage;
    });

    const topStudents = Array.from(studentPerformance.values())
      .map((data) => ({
        name: data.student.name,
        email: data.student.email,
        avgPercentage: Math.round(data.totalPercentage / data.totalTests),
        testsCompleted: data.totalTests,
      }))
      .sort((a, b) => b.avgPercentage - a.avgPercentage)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalSubjects: subjects.length,
        totalTests: tests.length,
        totalStudents: uniqueStudents.size,
        avgPercentage,
        completionRate,
        totalResults: completedResults.length,
      },
      recentTests,
      subjectDistribution,
      monthlyTrend,
      performanceDistribution,
      topStudents,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import User from "@/models/User";
import Test from "@/models/Test";
import Result from "@/models/Result";

export async function GET() {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;

  try {
    await dbConnect();

    // Get all users
    const allUsers = await User.find({}).lean();
    const teachers = allUsers.filter((u) => u.role === "teacher");
    const students = allUsers.filter((u) => u.role === "student");
    const admins = allUsers.filter((u) =>
      ["admin", "superadmin"].includes(u.role)
    );

    // Get all tests
    const allTests = await Test.find({}).populate("teacher", "name").lean();

    // Get all results
    const allResults = await Result.find({ testCompleted: true })
      .populate("student", "name email")
      .populate("test", "title")
      .lean();

    // User growth trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const usersInMonth = allUsers.filter((u) => {
        const createdDate = new Date(u.dateJoined || u.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;

      const teachersInMonth = teachers.filter((u) => {
        const createdDate = new Date(u.dateJoined || u.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;

      const studentsInMonth = students.filter((u) => {
        const createdDate = new Date(u.dateJoined || u.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;

      userGrowth.push({
        month: monthName,
        users: usersInMonth,
        teachers: teachersInMonth,
        students: studentsInMonth,
      });
    }

    // Test activity by month (last 6 months)
    const testActivity = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const testsCreated = allTests.filter((t) => {
        const createdDate = new Date(t.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;

      const testsCompleted = allResults.filter((r) => {
        const submittedDate = new Date(r.submittedAt);
        return submittedDate >= monthStart && submittedDate <= monthEnd;
      }).length;

      testActivity.push({
        month: monthName,
        created: testsCreated,
        completed: testsCompleted,
      });
    }

    // Role distribution
    const roleDistribution = [
      { role: "Students", count: students.length },
      { role: "Teachers", count: teachers.length },
      { role: "Admins", count: admins.length },
    ];

    // Performance overview
    const avgPerformance =
      allResults.length > 0
        ? Math.round(
            allResults.reduce((sum, r) => sum + r.percentage, 0) /
              allResults.length
          )
        : 0;

    const performanceDistribution = [
      {
        range: "90-100%",
        count: allResults.filter((r) => r.percentage >= 90).length,
      },
      {
        range: "75-89%",
        count: allResults.filter((r) => r.percentage >= 75 && r.percentage < 90)
          .length,
      },
      {
        range: "60-74%",
        count: allResults.filter((r) => r.percentage >= 60 && r.percentage < 75)
          .length,
      },
      {
        range: "Below 60%",
        count: allResults.filter((r) => r.percentage < 60).length,
      },
    ];

    // Recent activity (last 10 tests created)
    const recentTests = allTests
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10)
      .map((test) => ({
        _id: test._id,
        title: test.title,
        subject: test.subject,
        teacher: test.teacher?.name || "Unknown",
        createdAt: test.createdAt,
        totalQuestions: test.totalQuestions || 0,
      }));

    // Top performing teachers (by average student scores)
    const teacherPerformance = new Map();
    allResults.forEach((result) => {
      // Find the test and its teacher
      const resultTestId = typeof result.test === 'string' 
        ? result.test 
        : (result.test?._id || result.test)?.toString();
      
      const test = allTests.find(
        (t) => (t._id as any).toString() === resultTestId
      );
      if (test && test.teacher) {
        const teacherId = (test.teacher._id as any).toString();
        const teacherName = test.teacher.name;

        if (!teacherPerformance.has(teacherId)) {
          teacherPerformance.set(teacherId, {
            name: teacherName,
            totalTests: 0,
            totalResults: 0,
            totalPercentage: 0,
          });
        }

        const data = teacherPerformance.get(teacherId);
        data.totalResults += 1;
        data.totalPercentage += result.percentage;
      }
    });

    // Also count tests created by each teacher
    teachers.forEach((teacher) => {
      const teacherId = (teacher._id as any).toString();
      const testsCreated = allTests.filter(
        (t) => t.teacher?._id?.toString() === teacherId
      ).length;

      if (testsCreated > 0 && !teacherPerformance.has(teacherId)) {
        teacherPerformance.set(teacherId, {
          name: teacher.name,
          totalTests: testsCreated,
          totalResults: 0,
          totalPercentage: 0,
        });
      } else if (teacherPerformance.has(teacherId)) {
        teacherPerformance.get(teacherId).totalTests = testsCreated;
      }
    });

    const topTeachers = Array.from(teacherPerformance.values())
      .filter((data) => data.totalResults > 0)
      .map((data) => ({
        name: data.name,
        testsCreated: data.totalTests,
        avgPerformance: Math.round(data.totalPercentage / data.totalResults),
        totalResults: data.totalResults,
      }))
      .sort((a, b) => b.avgPerformance - a.avgPerformance)
      .slice(0, 5);

    // System stats
    const totalAssignments = allTests.reduce(
      (sum, test) => sum + (test.assignedStudents?.length || 0),
      0
    );
    const completionRate =
      totalAssignments > 0
        ? Math.round((allResults.length / totalAssignments) * 100)
        : 0;

    // Active users (users created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = allUsers.filter(
      (u) => new Date(u.dateJoined || u.createdAt) >= thirtyDaysAgo
    ).length;

    return NextResponse.json({
      summary: {
        totalUsers: allUsers.length,
        totalTeachers: teachers.length,
        totalStudents: students.length,
        totalAdmins: admins.length,
        totalTests: allTests.length,
        totalResults: allResults.length,
        avgPerformance,
        completionRate,
        activeUsers,
      },
      userGrowth,
      testActivity,
      roleDistribution,
      performanceDistribution,
      recentTests,
      topTeachers,
    });
  } catch (error: any) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

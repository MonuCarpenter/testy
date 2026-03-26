import Test from "@/models/Test";
import Result from "@/models/Result";
import User from "@/models/User";

export interface TeacherContext {
  teacherName: string;
  totalTests: number;
  totalStudents: number;
  classStats: {
    averageScore: number;
    medianScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
  };
  performanceBrackets: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  subjectPerformance: Array<{
    subject: string;
    avgScore: number;
    totalTests: number;
    studentCount: number;
  }>;
  studentsNeedingHelp: Array<{
    name: string;
    avgScore: number;
    weakSubjects: string[];
    testsCompleted: number;
  }>;
  recentTests: Array<{
    title: string;
    subject: string;
    avgScore: number;
    completionRate: number;
    date: string;
  }>;
}

export function buildTeacherSystemPrompt(context: TeacherContext): string {
  return `You are an AI teaching assistant helping Professor ${
    context.teacherName
  } analyze student performance and improve teaching effectiveness.

Teacher Profile:
- Total Tests Created: ${context.totalTests}
- Total Students: ${context.totalStudents}
- Class Average Score: ${context.classStats.averageScore}%
- Pass Rate: ${context.classStats.passRate}%

Class Performance Overview:
${context.performanceBrackets.excellent} students (Excellent: 90-100%)
${context.performanceBrackets.good} students (Good: 75-89%)
${context.performanceBrackets.average} students (Average: 60-74%)
${context.performanceBrackets.poor} students (Poor: <60%)

Subject-wise Performance:
${context.subjectPerformance
  .map(
    (s) =>
      `- ${s.subject}: ${s.avgScore}% average (${s.totalTests} tests, ${s.studentCount} students)`
  )
  .join("\n")}

Students Needing Attention (avg < 65%):
${
  context.studentsNeedingHelp.length > 0
    ? context.studentsNeedingHelp
        .map(
          (s) =>
            `- ${s.name}: ${s.avgScore}% (weak in: ${s.weakSubjects.join(
              ", "
            )})`
        )
        .join("\n")
    : "All students performing adequately"
}

Recent Test Activity:
${context.recentTests
  .slice(0, 5)
  .map(
    (t) =>
      `- ${t.title} (${t.subject}): ${t.avgScore}% average, ${t.completionRate}% completion`
  )
  .join("\n")}

Your role as Teaching Assistant:
1. Analyze class-wide performance trends and patterns
2. Identify struggling students who need intervention
3. Highlight difficult topics and questions across the class
4. Suggest evidence-based teaching strategies and improvements
5. Provide actionable, data-driven insights
6. Recommend remedial actions and curriculum adjustments
7. Compare test effectiveness and difficulty
8. Help with lesson planning and resource allocation
9. Identify knowledge gaps in the class
10. Suggest differentiated instruction approaches

Guidelines:
- Be professional, analytical, and solution-oriented
- Focus on improving student outcomes through better teaching
- Use actual test data and statistics when making recommendations
- Provide specific, actionable advice (not generic suggestions)
- When discussing struggling students, be respectful and constructive
- Prioritize interventions based on urgency and impact
- Consider both individual and class-wide perspectives
- Suggest realistic, implementable solutions
- Keep responses concise (3-5 sentences) unless detailed analysis is requested
- Use data to support your recommendations

Remember: Your goal is to help Professor ${
    context.teacherName
  } become more effective by providing insights they might miss when looking at raw data. Be their analytical partner in improving student learning outcomes.`;
}

export async function buildTeacherContext(
  teacherId: string
): Promise<TeacherContext> {
  // Get teacher info
  const teacher = await User.findById(teacherId).select("name").lean();
  const teacherName = (teacher as any)?.name || "Teacher";

  // Get all tests created by this teacher
  const allTests = await Test.find({ teacher: teacherId })
    .select("_id title subject assignedStudents totalQuestions createdAt")
    .lean();

  const testIds = allTests.map((t) => t._id);

  // Get all unique students assigned to this teacher's tests
  const uniqueStudentIds = new Set<string>();
  allTests.forEach((test) => {
    test.assignedStudents.forEach((studentId: any) => {
      uniqueStudentIds.add(studentId.toString());
    });
  });

  // Get all results for this teacher's tests
  const allResults = await Result.find({
    test: { $in: testIds },
    testCompleted: true,
  })
    .populate("test", "title subject")
    .populate("student", "name")
    .lean();

  // Calculate class statistics
  const totalTests = allTests.length;
  const totalStudents = uniqueStudentIds.size;

  const allScores = allResults.map((r) => r.percentage);
  const avgScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
      : 0;

  const sortedScores = [...allScores].sort((a, b) => a - b);
  const medianScore =
    sortedScores.length > 0
      ? sortedScores[Math.floor(sortedScores.length / 2)]
      : 0;

  const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
  const lowestScore = allScores.length > 0 ? Math.min(...allScores) : 0;
  const passRate =
    allScores.length > 0
      ? Math.round(
          (allScores.filter((s) => s >= 60).length / allScores.length) * 100
        )
      : 0;

  // Performance brackets
  const excellent = allScores.filter((s) => s >= 90).length;
  const good = allScores.filter((s) => s >= 75 && s < 90).length;
  const average = allScores.filter((s) => s >= 60 && s < 75).length;
  const poor = allScores.filter((s) => s < 60).length;

  // Subject-wise performance
  const subjectMap = new Map();
  allResults.forEach((result) => {
    const subject = (result.test as any).subject;
    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, {
        subject,
        totalScore: 0,
        count: 0,
        students: new Set(),
      });
    }
    const data = subjectMap.get(subject);
    data.totalScore += result.percentage;
    data.count += 1;
    data.students.add((result.student as any)._id.toString());
  });

  const subjectPerformance = Array.from(subjectMap.values()).map((data) => ({
    subject: data.subject,
    avgScore: Math.round(data.totalScore / data.count),
    totalTests: data.count,
    studentCount: data.students.size,
  }));

  // Students needing help (avg < 65%)
  const studentPerformanceMap = new Map();
  allResults.forEach((result) => {
    const studentId = (result.student as any)._id.toString();
    const studentName = (result.student as any).name;
    const subject = (result.test as any).subject;

    if (!studentPerformanceMap.has(studentId)) {
      studentPerformanceMap.set(studentId, {
        name: studentName,
        totalScore: 0,
        count: 0,
        subjectScores: new Map(),
      });
    }

    const studentData = studentPerformanceMap.get(studentId);
    studentData.totalScore += result.percentage;
    studentData.count += 1;

    if (!studentData.subjectScores.has(subject)) {
      studentData.subjectScores.set(subject, { total: 0, count: 0 });
    }
    const subjectData = studentData.subjectScores.get(subject);
    subjectData.total += result.percentage;
    subjectData.count += 1;
  });

  const studentsNeedingHelp = Array.from(studentPerformanceMap.values())
    .map((data) => {
      const avgScore = Math.round(data.totalScore / data.count);
      const weakSubjects = Array.from(data.subjectScores.entries())
        .filter((entry: any) => {
          const [_, scores] = entry;
          return scores.total / scores.count < 65;
        })
        .map((entry: any) => entry[0] as string);

      return {
        name: data.name as string,
        avgScore,
        weakSubjects,
        testsCompleted: data.count as number,
      };
    })
    .filter((s) => s.avgScore < 65)
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 10);

  // Recent tests with performance
  const testPerformanceMap = new Map();
  allResults.forEach((result) => {
    const testId = ((result.test as any)._id as any).toString();
    if (!testPerformanceMap.has(testId)) {
      testPerformanceMap.set(testId, {
        title: (result.test as any).title,
        subject: (result.test as any).subject,
        scores: [],
        totalAssigned: 0,
      });
    }
    testPerformanceMap.get(testId).scores.push(result.percentage);
  });

  // Match with test assignment counts
  allTests.forEach((test) => {
    const testId = (test._id as any).toString();
    if (testPerformanceMap.has(testId)) {
      testPerformanceMap.get(testId).totalAssigned =
        test.assignedStudents.length;
    }
  });

  const recentTests = allTests
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10)
    .map((test) => {
      const testId = (test._id as any).toString();
      const perfData = testPerformanceMap.get(testId);
      const avgScore =
        perfData && perfData.scores.length > 0
          ? Math.round(
              perfData.scores.reduce((sum: number, s: number) => sum + s, 0) /
                perfData.scores.length
            )
          : 0;
      const completionRate =
        perfData && perfData.totalAssigned > 0
          ? Math.round((perfData.scores.length / perfData.totalAssigned) * 100)
          : 0;

      return {
        title: test.title,
        subject: test.subject,
        avgScore,
        completionRate,
        date: test.createdAt.toISOString(),
      };
    });

  return {
    teacherName,
    totalTests,
    totalStudents,
    classStats: {
      averageScore: avgScore,
      medianScore,
      highestScore,
      lowestScore,
      passRate,
    },
    performanceBrackets: {
      excellent,
      good,
      average,
      poor,
    },
    subjectPerformance,
    studentsNeedingHelp,
    recentTests,
  };
}

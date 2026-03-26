"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  FileCheck,
  Clock,
} from "lucide-react";

type DashboardData = {
  summary: {
    totalSubjects: number;
    totalTests: number;
    totalStudents: number;
    avgPercentage: number;
    completionRate: number;
    totalResults: number;
  };
  recentTests: Array<{
    _id: string;
    title: string;
    subject: string;
    createdAt: string;
    assignedCount: number;
    completedCount: number;
  }>;
  subjectDistribution: Array<{ subject: string; count: number }>;
  monthlyTrend: Array<{ month: string; tests: number }>;
  performanceDistribution: Array<{ grade: string; count: number }>;
  topStudents: Array<{
    name: string;
    email: string;
    avgPercentage: number;
    testsCompleted: number;
  }>;
};

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/dashboard");
      const result = await res.json();
      console.log("Dashboard response:", { status: res.status, data: result });
      if (res.ok) {
        setData(result);
      } else {
        console.error("Dashboard API error:", result);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-700 mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your teaching activities and student performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <BookOpen className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.totalSubjects}
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Subjects
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <FileCheck className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.totalTests}
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Tests
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <Users className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.totalStudents}
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Students
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <Award className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.avgPercentage}%
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Avg. Score
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <TrendingUp className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.completionRate}%
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Completion
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <Clock className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.totalResults}
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Submissions
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Test Creation Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="tests"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", r: 5 }}
                activeDot={{ r: 7 }}
                name="Tests Created"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Tests by Subject
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.subjectDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ subject, count }) => `${subject}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.subjectDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Student Performance Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.performanceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Students" radius={[8, 8, 0, 0]}>
                {data.performanceDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Students */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Top Performing Students
          </h3>
          <div className="space-y-3">
            {data.topStudents.length > 0 ? (
              data.topStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-white rounded-lg border border-violet-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {student.testsCompleted} test
                        {student.testsCompleted !== 1 ? "s" : ""} completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-violet-700">
                      {student.avgPercentage}%
                    </p>
                    <p className="text-xs text-gray-500">avg score</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No student data available yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Tests & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tests */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Recent Tests</h3>
          <div className="space-y-3">
            {data.recentTests.length > 0 ? (
              data.recentTests.map((test) => (
                <div
                  key={test._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{test.title}</p>
                    <p className="text-sm text-gray-600">
                      {test.subject} •{" "}
                      {new Date(test.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {test.completedCount}/{test.assignedCount} completed
                    </p>
                    <p className="text-xs text-gray-500">
                      {test.assignedCount} assigned
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No tests created yet
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-3">
            <a
              href="/teacher/questions"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition text-center"
            >
              📝 Upload Questions
            </a>
            <a
              href="/teacher/tests"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition text-center"
            >
              ✅ Create Test
            </a>
            <a
              href="/teacher/terms"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition text-center"
            >
              📚 Edit Terms
            </a>
            <a
              href="/teacher/results"
              className="bg-gradient-to-r from-violet-500 to-violet-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition text-center"
            >
              📊 View Results
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

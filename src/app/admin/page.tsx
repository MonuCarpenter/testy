"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Award,
  Activity,
} from "lucide-react";

type DashboardData = {
  summary: {
    totalUsers: number;
    totalTeachers: number;
    totalStudents: number;
    totalAdmins: number;
    totalTests: number;
    totalResults: number;
    avgPerformance: number;
    completionRate: number;
    activeUsers: number;
  };
  userGrowth: Array<{
    month: string;
    users: number;
    teachers: number;
    students: number;
  }>;
  testActivity: Array<{ month: string; created: number; completed: number }>;
  roleDistribution: Array<{ role: string; count: number }>;
  performanceDistribution: Array<{ range: string; count: number }>;
  recentTests: Array<{
    _id: string;
    title: string;
    subject: string;
    teacher: string;
    createdAt: string;
    totalQuestions: number;
  }>;
  topTeachers: Array<{
    name: string;
    testsCreated: number;
    avgPerformance: number;
    totalResults: number;
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

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard");
      const result = await res.json();
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
      {/* Greeting section */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-blue-800 via-blue-600 to-fuchsia-400">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            System-wide overview and analytics
          </p>
        </div>
        {/* System Status */}
        <div className="flex items-center gap-3 bg-gradient-to-l from-green-100 to-green-300/40 border border-green-300 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg">
          <Activity className="w-5 h-5 text-green-700" />
          <span className="text-zinc-700">System Active</span>
          <span className="text-xs text-green-700">
            {data.summary.activeUsers} new users this month
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <Users className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.totalUsers}
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Total Users
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <GraduationCap className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.totalTeachers}
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Teachers
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
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <BookOpen className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.totalTests}
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Total Tests
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <Award className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.avgPerformance}%
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Avg Score
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <TrendingUp className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.completionRate}%
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Completion
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Trend */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            User Growth Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.userGrowth}>
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
                dataKey="students"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ fill: "#ec4899", r: 4 }}
                name="Students"
              />
              <Line
                type="monotone"
                dataKey="teachers"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", r: 4 }}
                name="Teachers"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Test Activity */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Test Activity
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.testActivity}>
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
              <Bar
                dataKey="created"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Tests Created"
              />
              <Bar
                dataKey="completed"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="Tests Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            User Role Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ role, count }) => `${role}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.roleDistribution.map((entry, index) => (
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

        {/* Performance Distribution */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Overall Performance Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.performanceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#6b7280" />
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
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tests */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Recently Created Tests
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {data.recentTests.length > 0 ? (
              data.recentTests.map((test) => (
                <div
                  key={test._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{test.title}</p>
                    <p className="text-sm text-gray-600">
                      {test.subject} • By {test.teacher}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {test.totalQuestions} questions
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(test.createdAt).toLocaleDateString()}
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

        {/* Top Teachers */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Top Performing Teachers
          </h3>
          <div className="space-y-3">
            {data.topTeachers.length > 0 ? (
              data.topTeachers.map((teacher, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {teacher.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {teacher.testsCreated} tests • {teacher.totalResults}{" "}
                        results
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-700">
                      {teacher.avgPerformance}%
                    </p>
                    <p className="text-xs text-gray-500">avg score</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No teacher data available yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
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
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

type DashboardData = {
  summary: {
    totalAssigned: number;
    totalCompleted: number;
    totalPending: number;
    avgScore: number;
    highestScore: number;
    lowestScore: number;
    completionRate: number;
  };
  performanceTrend: Array<{ test: string; score: number; title: string }>;
  subjectStats: Array<{ subject: string; tests: number; avgScore: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  recentResults: Array<{
    _id: string;
    testTitle: string;
    subject: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    submittedAt: string;
  }>;
  upcomingTests: Array<{
    _id: string;
    title: string;
    subject: string;
    durationMinutes: number;
    totalQuestions: number;
  }>;
  weakestSubject: {
    subject: string;
    avgScore: number;
    tests: number;
  } | null;
};

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/dashboard");
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700";
    if (score >= 75) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-green-700 mb-2">
          Student Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your progress and upcoming tests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <BookOpen className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.totalAssigned}
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Assigned
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <CheckCircle className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.totalCompleted}
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Completed
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <Clock className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.totalPending}
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Pending
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <Award className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.avgScore}%
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Avg Score
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <TrendingUp className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.highestScore}%
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Highest
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white text-center flex flex-col gap-1 md:gap-2 py-4 md:py-6 px-2 md:px-4 shadow-lg">
          <Target className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1" />
          <div className="text-2xl md:text-3xl font-extrabold">
            {data.summary.completionRate}%
          </div>
          <div className="uppercase text-[10px] md:text-xs font-medium opacity-90">
            Completion
          </div>
        </div>
      </div>

      {/* Weak Subject Alert */}
      {data.weakestSubject && data.weakestSubject.avgScore < 75 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">
              Study Recommendation
            </h3>
          </div>
          <p className="text-sm text-yellow-800">
            Consider reviewing <strong>{data.weakestSubject.subject}</strong> -
            your average score is {data.weakestSubject.avgScore}% across{" "}
            {data.weakestSubject.tests} test(s).
          </p>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Performance Trend
          </h3>
          {data.performanceTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="test"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value}%`,
                    props.payload.title,
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Score %"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No completed tests yet
            </div>
          )}
        </div>

        {/* Subject-wise Performance */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Subject-wise Performance
          </h3>
          {data.subjectStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.subjectStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="avgScore"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="Avg Score %"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No completed tests yet
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Score Distribution
          </h3>
          {data.scoreDistribution.some((s) => s.count > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.scoreDistribution.filter((s) => s.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.scoreDistribution
                    .filter((s) => s.count > 0)
                    .map((entry, index) => (
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
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No completed tests yet
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Recent Test Results
          </h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {data.recentResults.length > 0 ? (
              data.recentResults.map((result) => (
                <div
                  key={result._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => router.push(`/student/review/${result._id}`)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {result.testTitle}
                    </p>
                    <p className="text-xs text-gray-600">
                      {result.subject} •{" "}
                      {new Date(result.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${getScoreColor(
                        result.score
                      )}`}
                    >
                      {result.score}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {result.correctAnswers}/{result.totalQuestions}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No completed tests yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Tests */}
      <div className="rounded-2xl bg-white border border-border shadow-lg p-6">
        <h3 className="font-bold text-lg text-gray-800 mb-4">Upcoming Tests</h3>
        {data.upcomingTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.upcomingTests.map((test) => (
              <div
                key={test._id}
                className="rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-200 p-4 shadow-sm hover:shadow-md transition"
              >
                <h4 className="font-bold text-green-800 mb-2">{test.title}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  Subject: <span className="font-medium">{test.subject}</span>
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Duration: {test.durationMinutes} min
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Questions: {test.totalQuestions}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No pending tests. Great job! 🎉
          </div>
        )}
      </div>
    </div>
  );
}

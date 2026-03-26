import {
  Users,
  FileText,
  TrendingUp,
  Award,
  AlertCircle,
  Target,
} from "lucide-react";

interface ClassOverviewProps {
  totalTests: number;
  totalStudents: number;
  averageScore: number;
  passRate: number;
  studentsNeedingHelp: number;
  performanceBrackets: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
}

export default function ClassOverview({
  totalTests,
  totalStudents,
  averageScore,
  passRate,
  studentsNeedingHelp,
  performanceBrackets,
}: ClassOverviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Class Overview
      </h3>

      <div className="space-y-3">
        {/* Total Students */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">
              Total Students
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{totalStudents}</p>
        </div>

        {/* Total Tests */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-900">
              Tests Created
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{totalTests}</p>
        </div>

        {/* Average Score */}
        <div className="bg-linear-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-900">
              Class Average
            </span>
          </div>
          <p className="text-2xl font-bold text-green-700">{averageScore}%</p>
        </div>

        {/* Pass Rate */}
        <div className="bg-linear-to-br from-cyan-50 to-cyan-100 p-3 rounded-lg border border-cyan-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-medium text-cyan-900">Pass Rate</span>
          </div>
          <p className="text-2xl font-bold text-cyan-700">{passRate}%</p>
        </div>

        {/* Students Needing Help */}
        {studentsNeedingHelp > 0 && (
          <div className="bg-linear-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-900">
                Need Attention
              </span>
            </div>
            <p className="text-2xl font-bold text-red-700">
              {studentsNeedingHelp}
            </p>
            <p className="text-xs text-red-600 mt-1">students below 65%</p>
          </div>
        )}
      </div>

      {/* Performance Distribution */}
      <div className="bg-white p-3 rounded-lg border border-border mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">
            Performance Distribution
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-700">🟢 Excellent (90-100%)</span>
            <span className="font-semibold">
              {performanceBrackets.excellent}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-700">🔵 Good (75-89%)</span>
            <span className="font-semibold">{performanceBrackets.good}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-yellow-700">🟡 Average (60-74%)</span>
            <span className="font-semibold">{performanceBrackets.average}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-700">🔴 Poor (&lt;60%)</span>
            <span className="font-semibold">{performanceBrackets.poor}</span>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Ask me about struggling students, test
          analysis, or teaching strategies to improve outcomes!
        </p>
      </div>
    </div>
  );
}

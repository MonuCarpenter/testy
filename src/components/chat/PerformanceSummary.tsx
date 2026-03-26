import { Award, Target, TrendingUp, BookOpen } from "lucide-react";

interface PerformanceSummaryProps {
  totalTests: number;
  completedTests: number;
  averageScore: number;
  strongestSubject: string | null;
  weakestSubject: string | null;
}

export default function PerformanceSummary({
  totalTests,
  completedTests,
  averageScore,
  strongestSubject,
  weakestSubject,
}: PerformanceSummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Your Performance
      </h3>

      <div className="space-y-3">
        {/* Average Score */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">
              Average Score
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{averageScore}%</p>
        </div>

        {/* Tests Completed */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-900">
              Tests Completed
            </span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {completedTests}
            <span className="text-sm text-green-600 ml-1">/ {totalTests}</span>
          </p>
        </div>

        {/* Strongest Subject */}
        {strongestSubject && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-900">
                Strongest Subject
              </span>
            </div>
            <p className="text-sm font-bold text-purple-700">
              {strongestSubject}
            </p>
          </div>
        )}

        {/* Weakest Subject */}
        {weakestSubject && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-900">
                Focus Area
              </span>
            </div>
            <p className="text-sm font-bold text-orange-700">
              {weakestSubject}
            </p>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-4">
        <p className="text-xs text-yellow-800">
          💡 <strong>Tip:</strong> Ask me specific questions about your tests or
          use quick actions to get personalized study guidance!
        </p>
      </div>
    </div>
  );
}

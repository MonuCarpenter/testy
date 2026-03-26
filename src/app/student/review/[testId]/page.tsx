"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Info,
} from "lucide-react";

type QuestionReview = {
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  studentAnswerIndex: number | null;
  isCorrect: boolean;
  explanation: string | null;
};

type ReviewData = {
  testTitle: string;
  testSubject: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  questions: QuestionReview[];
};

export default function ReviewTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      try {
        setLoading(true);
        setError(null);
        const r = await fetch(`/api/student/review/${testId}`);
        const result = await r.json();
        if (!r.ok) {
          setError(result.error || "Failed to load review");
          return;
        }
        setData(result);
      } catch (e) {
        setError("Network error while loading review");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId]);

  const getOptionLabel = (index: number) => String.fromCharCode(65 + index);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading review...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="text-red-700 font-semibold text-lg">
            {error || "Failed to load review"}
          </p>
          <Button
            onClick={() => router.push("/student/review")}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reviews
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.push("/student/review")}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Test Summary */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6">
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          {data.testTitle}
        </h1>
        <p className="text-muted-foreground mb-4">
          Subject: {data.testSubject}
        </p>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <div className="text-3xl font-bold text-green-700">
              {data.percentage}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">Score</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
            <div className="text-3xl font-bold text-blue-700">
              {data.correctAnswers}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Correct</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
            <div className="text-3xl font-bold text-gray-700">
              {data.totalQuestions}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total</div>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">
          Detailed Answer Review
        </h2>

        {data.questions.map((q) => (
          <div
            key={q.questionNumber}
            className={`bg-white rounded-2xl shadow-md border-2 p-6 ${
              q.isCorrect
                ? "border-green-300 bg-green-50/30"
                : "border-red-300 bg-red-50/30"
            }`}
          >
            {/* Question Header */}
            <div className="flex items-start gap-3 mb-4">
              {q.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 mt-1 shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-gray-600">
                    Question {q.questionNumber}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      q.isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {q.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {q.question}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 ml-9">
              {q.options.map((option, idx) => {
                const isCorrect = idx === q.correctAnswerIndex;
                const isStudentAnswer = idx === q.studentAnswerIndex;
                const isWrongAnswer = isStudentAnswer && !isCorrect;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? "bg-green-50 border-green-400"
                        : isWrongAnswer
                        ? "bg-red-50 border-red-400"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-700">
                        {getOptionLabel(idx)}.
                      </span>
                      <span className="flex-1 text-gray-800">{option}</span>
                      {isCorrect && (
                        <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                          Correct Answer
                        </span>
                      )}
                      {isWrongAnswer && (
                        <span className="text-xs font-semibold text-red-700 bg-red-200 px-2 py-1 rounded">
                          Your Answer
                        </span>
                      )}
                      {isStudentAnswer && isCorrect && (
                        <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                          Your Answer ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            {q.explanation && (
              <div className="mt-4 ml-9 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">
                      Explanation:
                    </p>
                    <p className="text-blue-800 text-sm">{q.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Student didn't answer */}
            {q.studentAnswerIndex === null && (
              <div className="mt-4 ml-9 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                <p className="text-yellow-800 text-sm font-medium">
                  ⚠️ You did not answer this question
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Back Button at Bottom */}
      <div className="flex justify-center pt-6 pb-8">
        <Button
          onClick={() => router.push("/student/review")}
          variant="outline"
          size="lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Review List
        </Button>
      </div>
    </div>
  );
}

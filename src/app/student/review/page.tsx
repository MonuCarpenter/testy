"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, ChevronRight } from "lucide-react";
import Link from "next/link";

type CompletedTest = {
  _id: string;
  test: {
    _id: string;
    title: string;
    subject: string;
  } | null;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
};

export default function ReviewAnswersListPage() {
  const [tests, setTests] = useState<CompletedTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/student/results/completed");
        const data = await r.json();
        if (r.ok) {
          setTests(data.results || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-green-700 mb-2">
          Review Answers
        </h1>
        <p className="text-sm text-muted-foreground">
          Review your answers for completed tests. See which questions you got
          right or wrong.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : tests.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center min-h-[200px] bg-muted border border-border rounded-xl">
          <FileCheck className="w-12 h-12 text-muted-foreground mb-3" />
          <div className="text-xl text-muted-foreground font-semibold">
            No Completed Tests
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Complete a test to review your answers here.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests
            .filter((test) => test.test !== null) // Filter out deleted tests
            .map((test) => (
              <Link
                key={String(test._id)}
                href={`/student/review/${test.test!._id}`}
                className="group"
              >
                <div className="rounded-2xl bg-white border border-border shadow-sm p-6 flex flex-col gap-3 hover:shadow-lg hover:border-green-300 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-green-800 mb-1 group-hover:text-green-600 transition-colors">
                        {test.test!.title}
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Subject: {test.test!.subject}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          test.percentage >= 70
                            ? "bg-green-500"
                            : test.percentage >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="font-semibold">{test.percentage}%</span>
                    </div>
                    <div className="text-muted-foreground">
                      {test.correctAnswers}/{test.totalQuestions} correct
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600 font-medium">
                    <FileCheck className="w-4 h-4" />
                    <span>Review Answers</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}

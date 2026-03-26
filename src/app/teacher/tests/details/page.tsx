"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

type QRow = {
  questionNumber: number;
  question: string;
  options: string[];
  answerIndex: number;
};

export default function TeacherTestDetailsPage() {
  const search = useSearchParams();
  const testId = search.get("test") || "";

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<QRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    if (!testId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/teacher/tests/${testId}/questions`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRows(
        (data.questions || []).sort(
          (a: QRow, b: QRow) => a.questionNumber - b.questionNumber
        )
      );
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [testId]);

  const addNew = () => {
    const nextNum = (rows[rows.length - 1]?.questionNumber || 0) + 1;
    setRows((prev) => [
      ...prev,
      {
        questionNumber: nextNum,
        question: "",
        options: ["", "", "", ""],
        answerIndex: 0,
      },
    ]);
  };

  const saveRow = async (row: QRow) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/tests/${testId}/questions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      await load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (questionNumber: number) => {
    setDeleting(questionNumber);
    try {
      const res = await fetch(`/api/teacher/tests/${testId}/questions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionNumber }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) =>
        prev.filter((r) => r.questionNumber !== questionNumber)
      );
    } catch {
    } finally {
      setDeleting(null);
    }
  };

  if (!testId)
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No test selected. Open this page as /teacher/tests/details?test=TEST_ID
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight text-blue-700 mb-2">
        Test Details
      </h1>
      <div className="text-sm text-muted-foreground">Test ID: {testId}</div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Total questions: {rows.length}
        </div>
        <Button size="sm" onClick={addNew}>
          Add Question
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <Skeleton className="h-10" />
        ) : rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No questions yet. Add one.
          </div>
        ) : (
          rows.map((r, i) => (
            <div
              key={r.questionNumber}
              className="border border-border rounded-xl p-4 bg-card"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold">
                  Question {r.questionNumber}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => saveRow(r)}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteRow(r.questionNumber)}
                    disabled={deleting === r.questionNumber}
                  >
                    {deleting === r.questionNumber ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
              <textarea
                className="w-full px-3 py-2 rounded-lg bg-input border border-border mb-3"
                rows={3}
                placeholder="Question text"
                value={r.question}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((x) =>
                      x.questionNumber === r.questionNumber
                        ? { ...x, question: e.target.value }
                        : x
                    )
                  )
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {r.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-6 text-sm font-bold">
                      {String.fromCharCode(65 + idx)})
                    </div>
                    <input
                      className="flex-1 px-3 py-2 rounded-lg bg-input border border-border"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.questionNumber === r.questionNumber
                              ? {
                                  ...x,
                                  options: x.options.map((o, j) =>
                                    j === idx ? e.target.value : o
                                  ),
                                }
                              : x
                          )
                        )
                      }
                    />
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        checked={r.answerIndex === idx}
                        onChange={() =>
                          setRows((prev) =>
                            prev.map((x) =>
                              x.questionNumber === r.questionNumber
                                ? { ...x, answerIndex: idx }
                                : x
                            )
                          )
                        }
                      />{" "}
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

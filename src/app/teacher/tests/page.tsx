"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type TestRow = {
  id: string;
  title: string;
  subject: string;
  totalQuestions: number;
  status: string;
};

export default function TeacherTestsPage() {
  const [tests, setTests] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/tests?mine=1");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTests(
        data.map((t: any) => ({
          id: String(t._id),
          title: t.title,
          subject: t.subject,
          totalQuestions: t.totalQuestions || 0,
          status: t.status,
        }))
      );
    } catch {
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/teacher/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          durationMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTitle("");
      setSubject("");
      setDurationMinutes(60);
      await load();
    } catch {
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/tests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTests((prev) => prev.filter((t) => t.id !== id));
    } catch {}
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl md:text-2xl font-bold tracking-tight text-blue-700 mb-4">
        My Tests
      </h1>

      <form
        onSubmit={create}
        className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-card border border-border rounded-xl p-4 shadow"
      >
        <input
          required
          placeholder="Title"
          className="px-3 py-2 rounded-lg bg-input border border-border text-sm md:text-base"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          required
          placeholder="Subject"
          className="px-3 py-2 rounded-lg bg-input border border-border text-sm md:text-base"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="number"
          min={10}
          step={5}
          placeholder="Duration (min)"
          className="px-3 py-2 rounded-lg bg-input border border-border text-sm md:text-base"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
        />
        <div className="col-span-1 md:col-span-2 flex items-center justify-end">
          <Button
            type="submit"
            disabled={creating}
            className="w-full md:w-auto"
          >
            {creating ? "Creating..." : "Create Test"}
          </Button>
        </div>
      </form>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Subject</th>
              <th className="text-left px-4 py-3">Questions</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8">
                  <Skeleton className="w-full h-10" />
                </td>
              </tr>
            ) : tests.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground text-sm"
                >
                  No tests yet
                </td>
              </tr>
            ) : (
              tests.map((t) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">
                    <a
                      href={`/teacher/tests/details?test=${t.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {t.title}
                    </a>
                  </td>
                  <td className="px-4 py-3">{t.subject}</td>
                  <td className="px-4 py-3">{t.totalQuestions}</td>
                  <td className="px-4 py-3 capitalize">{t.status}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button size="sm" asChild>
                        <a href={`/teacher/questions?test=${t.id}`}>
                          Upload Questions
                        </a>
                      </Button>
                      <Button size="sm" variant="secondary" asChild>
                        <a href={`/teacher/tests/details?test=${t.id}`}>
                          View Details
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => remove(t.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-4">
        {loading ? (
          <Skeleton className="w-full h-32" />
        ) : tests.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
            No tests yet
          </div>
        ) : (
          tests.map((t) => (
            <div
              key={t.id}
              className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3"
            >
              <div className="space-y-1">
                <a
                  href={`/teacher/tests/details?test=${t.id}`}
                  className="text-blue-600 hover:underline font-semibold text-base"
                >
                  {t.title}
                </a>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{t.subject}</span>
                  <span>•</span>
                  <span>{t.totalQuestions} Questions</span>
                  <span>•</span>
                  <span className="capitalize">{t.status}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" asChild className="w-full">
                  <a href={`/teacher/questions?test=${t.id}`}>
                    Upload Questions
                  </a>
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    asChild
                    className="flex-1"
                  >
                    <a href={`/teacher/tests/details?test=${t.id}`}>
                      View Details
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove(t.id)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

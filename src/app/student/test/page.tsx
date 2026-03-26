"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen } from "lucide-react";

export default function StudentTestsList() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/student/assignments/today");
        const data = await r.json();
        if (r.ok) setTests(data.tests || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight text-green-700 mb-4">
        Pending Tests
      </h1>
      <p className="text-sm text-muted-foreground -mt-4">
        Tests that are scheduled and haven't been completed yet. Once submitted,
        they will move to the Results tab.
      </p>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.length === 0 ? (
            <div className="col-span-full w-full flex flex-col items-center justify-center min-h-[200px] bg-muted border border-border rounded-xl">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
              <div className="text-xl text-muted-foreground font-semibold">
                No Upcoming Tests
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                You have no tests scheduled at the moment 📚
              </div>
            </div>
          ) : (
            tests.map((t: any) => (
              <div
                key={String(t._id)}
                className="rounded-2xl bg-white border border-border shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-green-600 mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-lg text-green-800 mb-1">
                      {t.title}
                    </div>
                    <div className="text-sm mb-1">
                      Subject:{" "}
                      <span className="font-medium text-green-600">
                        {t.subject}
                      </span>
                    </div>
                    <div className="text-sm mb-2 text-muted-foreground">
                      Date:{" "}
                      {t.testDate
                        ? new Date(t.testDate).toLocaleDateString()
                        : "-"}
                    </div>
                    {t.durationMinutes && (
                      <div className="text-xs text-muted-foreground">
                        Duration: {t.durationMinutes} minutes
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  asChild
                  className="mt-2 bg-green-600 hover:bg-green-700"
                >
                  <a href={`/student/test/${String(t._id)}`}>Start Test</a>
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

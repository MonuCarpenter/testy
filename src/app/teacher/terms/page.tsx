"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TeacherTermsPage() {
  const [bullets, setBullets] = useState<string[]>([""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const max = 10;

  // Load existing terms on mount
  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/terms");
      const data = await res.json();
      if (res.ok && data.terms) {
        setBullets(data.terms);
      }
    } catch (error) {
      console.error("Failed to load terms:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTerms = async () => {
    try {
      setSaving(true);
      setMessage("");
      const res = await fetch("/api/teacher/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terms: bullets }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          "Terms saved successfully! These will apply to all new tests."
        );
      } else {
        setMessage(data.error || "Failed to save terms");
      }
    } catch (error) {
      setMessage("Failed to save terms");
    } finally {
      setSaving(false);
    }
  };

  const update = (i: number, v: string) => {
    setBullets((bullets) => {
      let copy = [...bullets];
      copy[i] = v;
      return copy;
    });
  };

  const add = () => setBullets((b) => (b.length < max ? [...b, ""] : b));

  const remove = (i: number) =>
    setBullets((bullets) => bullets.filter((_, idx) => idx !== i));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading terms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-blue-700 mb-2">
          Edit Terms & Conditions Template
        </h1>
        <p className="text-sm text-muted-foreground">
          These terms will automatically apply to all new tests you create.
          Students will see them before starting any test.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          {bullets.length} / {max} bullets
        </div>
        <ul className="flex flex-col gap-3 mt-2">
          {bullets.map((b, i) => (
            <li className="flex gap-2 items-center" key={i}>
              <span className="font-bold">{i + 1}.</span>
              <input
                className="flex-1 px-4 py-2 rounded bg-input border border-border text-base focus:ring-2 focus:ring-blue-200"
                maxLength={200}
                value={b}
                onChange={(e) => update(i, e.target.value)}
                placeholder="Type rule here..."
              />
              {bullets.length > 1 && (
                <Button
                  size="icon-sm"
                  variant="destructive"
                  type="button"
                  onClick={() => remove(i)}
                >
                  ×
                </Button>
              )}
            </li>
          ))}
        </ul>
        <Button
          size="sm"
          className="mt-2"
          type="button"
          onClick={add}
          disabled={bullets.length >= max}
        >
          Add Bullet
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes("success")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={saveTerms} disabled={saving}>
          {saving ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            "Save Terms"
          )}
        </Button>
      </div>
    </div>
  );
}

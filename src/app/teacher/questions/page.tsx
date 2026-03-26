"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

async function downloadWordTemplate() {
  try {
    const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import(
      "docx"
    );
    const { saveAs } = await import("file-saver");

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: "Testy Question Template (Word DOCX)",
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200 },
            }),

            // Instructions
            new Paragraph({
              children: [
                new TextRun({
                  text: "Instructions:",
                  bold: true,
                  size: 24,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "• Use the exact format shown below for each question",
              bullet: { level: 0 },
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "• Start each question with Q1., Q2., Q3., etc.",
              bullet: { level: 0 },
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "• Options must be labeled A), B), C), D)",
              bullet: { level: 0 },
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "• Add 'Answer: X' after options (where X is A, B, C, or D)",
              bullet: { level: 0 },
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "• Leave a blank line between questions",
              bullet: { level: 0 },
              spacing: { after: 300 },
            }),

            // Example 1
            new Paragraph({
              children: [
                new TextRun({
                  text: "Q1. What is 2 + 2?",
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "A) 1",
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "B) 2",
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "C) 3",
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "D) 4",
              spacing: { after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Answer: D",
                  bold: true,
                  color: "0066CC",
                }),
              ],
              spacing: { after: 300 },
            }),

            // Example 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "Q2. Capital of France?",
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "A) Berlin",
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "B) Madrid",
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "C) Paris",
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "D) Rome",
              spacing: { after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Answer: C",
                  bold: true,
                  color: "0066CC",
                }),
              ],
              spacing: { after: 300 },
            }),

            // Example 3
            new Paragraph({
              children: [
                new TextRun({
                  text: "Q3. What color is the sky?",
                  bold: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "A) Red",
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "B) Green",
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "C) Blue",
              spacing: { after: 50 },
            }),
            new Paragraph({
              text: "D) Yellow",
              spacing: { after: 50 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Answer: C",
                  bold: true,
                  color: "0066CC",
                }),
              ],
              spacing: { after: 300 },
            }),

            // Footer note
            new Paragraph({
              children: [
                new TextRun({
                  text: "Note: Delete these examples and add your own questions following the same format.",
                  italics: true,
                  color: "666666",
                }),
              ],
              spacing: { before: 300 },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "questions_template.docx");
  } catch (e) {
    console.error("Error generating DOCX:", e);
    alert("Failed to generate Word template. Please try again.");
  }
}

async function downloadPptxTemplate() {
  try {
    const PptxGenJS = (await import("pptxgenjs")) as any;
    const pptx = new (PptxGenJS.default || (PptxGenJS as any))();
    pptx.layout = "LAYOUT_16x9";

    // Instructions slide
    const instructionsSlide = pptx.addSlide();
    instructionsSlide.addText("PowerPoint Question Template - Instructions", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 28,
      bold: true,
      color: "0066CC",
    });
    instructionsSlide.addText(
      "How to use this template:\n\n" +
        "• Each slide = 1 question\n" +
        "• First text box = Question\n" +
        "• Options = A), B), C), D) on separate lines\n" +
        "• Add answer in Notes section as 'Answer: A' (or B, C, D)\n\n" +
        "Example slides follow →",
      {
        x: 0.7,
        y: 1.5,
        w: 8.5,
        h: 3,
        fontSize: 16,
        lineSpacing: 24,
      }
    );

    const makeSlide = (question: string, options: string[], answer: string) => {
      const slide = pptx.addSlide();
      slide.addText(question, {
        x: 0.5,
        y: 0.4,
        w: 9,
        h: 1,
        fontSize: 24,
        bold: true,
        color: "333333",
      });
      slide.addText(
        options
          .map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`)
          .join("\n"),
        {
          x: 0.7,
          y: 1.5,
          w: 8.5,
          h: 3,
          fontSize: 18,
          lineSpacing: 28,
          color: "000000",
        }
      );
      slide.addNotes(`Answer: ${answer}`);
    };

    makeSlide("What is 2 + 2?", ["1", "2", "3", "4"], "D");
    makeSlide("Capital of France?", ["Berlin", "Madrid", "Paris", "Rome"], "C");
    makeSlide(
      "What color is the sky?",
      ["Red", "Green", "Blue", "Yellow"],
      "C"
    );

    await pptx.writeFile({ fileName: "questions_template.pptx" });
  } catch (e) {
    alert(
      "pptxgenjs is required to generate PPTX template. Please add it to your project if this fails."
    );
    console.error(e);
  }
}

type TestRow = {
  id: string;
  title: string;
  subject: string;
  totalQuestions: number;
};

export default function TeacherQuestionsPage() {
  const [tests, setTests] = useState<TestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>("");

  const selectedTest = useMemo(
    () => tests.find((t) => t.id === selected),
    [tests, selected]
  );

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

  const onUpload = async () => {
    if (!file || !selectedTest) return;
    setUploading(true);
    setResult("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("testId", selectedTest.id);
      fd.append("subject", selectedTest.subject);
      const res = await fetch("/api/teacher/upload/questions", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResult(`Uploaded ${data.count} questions to '${selectedTest.title}'.`);
      await load();
    } catch (e: any) {
      setResult(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight text-blue-700 mb-4">
        Upload Questions
      </h1>

      {/* Select Test */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-card border border-border rounded-2xl p-4 shadow-sm items-end">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Select Test</label>
          {loading ? (
            <Skeleton className="h-10" />
          ) : (
            <select
              className="px-3 py-2 rounded-lg bg-input border border-border"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Choose a test</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} — {t.subject}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Subject</label>
          <input
            disabled
            value={selectedTest?.subject || ""}
            className="px-3 py-2 rounded-lg bg-input border border-border"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Questions in Test</label>
          <input
            disabled
            value={selectedTest?.totalQuestions ?? 0}
            className="px-3 py-2 rounded-lg bg-input border border-border"
          />
        </div>
      </div>

      {/* File drag-and-drop area */}
      <div className="flex flex-col items-center justify-center gap-3 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl min-h-[180px] p-6 text-center">
        <div className="text-blue-500 text-lg font-semibold">
          Drag & drop your Word (.docx) or PowerPoint (.pptx) here or
          <span className="underline ml-1">browse</span>
        </div>
        <div className="text-xs text-blue-700/80">
          Supported formats: Word (.docx) with blocks, or PPTX (one question per
          slide)
        </div>
        <input
          type="file"
          accept=".docx,.pptx,.txt"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="px-3 py-2 rounded-lg bg-white border border-blue-200"
        />
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <Button size="sm" variant="secondary" onClick={downloadWordTemplate}>
            Download Word Template (.docx)
          </Button>
          <Button size="sm" onClick={downloadPptxTemplate}>
            Download PPTX Template
          </Button>
          <Button
            size="sm"
            onClick={onUpload}
            disabled={!file || !selectedTest || uploading}
          >
            {uploading ? "Uploading..." : "Upload to Selected Test"}
          </Button>
        </div>
        {result && <div className="text-sm text-blue-800 mt-2">{result}</div>}
      </div>

      {/* Recent Uploads placeholder remains */}
    </div>
  );
}

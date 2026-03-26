"use client";
import { Button } from "@/components/ui/button";

export default function TeacherAnswersPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight text-fuchsia-700 mb-4">
        Upload/Edit Answers
      </h1>
      <div className="flex flex-col gap-6">
        {/* File drag-and-drop area (placeholder for now) */}
        <div className="flex items-center justify-center bg-fuchsia-50 border-2 border-dashed border-fuchsia-200 rounded-2xl min-h-[120px] cursor-pointer">
          <div className="text-fuchsia-500 text-lg font-semibold">
            Drag & drop answer Excel/text here or{" "}
            <span className="underline ml-1">browse</span>
          </div>
        </div>
        {/* Editable table - mock */}
        <div className="bg-white border border-border shadow rounded-2xl p-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-fuchsia-700 uppercase text-xs">
              <tr>
                <th className="text-left px-3 py-2">#</th>
                <th className="text-left px-3 py-2">Q</th>
                <th className="text-left px-3 py-2">Correct</th>
                <th className="text-left px-3 py-2">Explanation</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3">1</td>
                <td className="px-3">A</td>
                <td className="px-3">B</td>
                <td className="px-3">Explanation here</td>
                <td className="text-right px-3">
                  <Button size="sm">Edit</Button>
                </td>
              </tr>
              <tr>
                <td className="px-3">2</td>
                <td className="px-3">C</td>
                <td className="px-3">D</td>
                <td className="px-3">-</td>
                <td className="text-right px-3">
                  <Button size="sm">Edit</Button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-end">
            <Button size="sm" variant="secondary">
              Auto-fill from Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

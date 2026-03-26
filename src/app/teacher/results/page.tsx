"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Search, Download } from "lucide-react";
import ExcelJS from "exceljs";

type ResultRow = {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    studentId?: string;
  };
  test: {
    _id: string;
    title: string;
    subject: string;
    totalQuestions: number;
  };
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  submittedAt: string;
};

export default function TeacherResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ResultRow[]>([]);
  const [filteredResults, setFilteredResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tests, setTests] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const r = await fetch("/api/teacher/results");
      const data = await r.json();
      if (r.ok) {
        const resultData = data.results || [];
        setResults(resultData);
        setFilteredResults(resultData);

        // Extract unique tests
        const uniqueTests = Array.from(
          new Map(
            resultData.map((res: ResultRow) => [
              res.test._id,
              { id: res.test._id, title: res.test.title },
            ])
          ).values()
        );
        setTests(uniqueTests as any);
      }
    } catch (error) {
      console.error("Failed to load results:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [selectedTest, searchQuery, results]);

  const applyFilters = () => {
    let filtered = [...results];

    // Filter by test
    if (selectedTest !== "all") {
      filtered = filtered.filter((r) => r.test._id === selectedTest);
    }

    // Filter by search query (student name or ID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.student.name.toLowerCase().includes(query) ||
          r.student.email.toLowerCase().includes(query) ||
          r.student.studentId?.toLowerCase().includes(query)
      );
    }

    setFilteredResults(filtered);
    console.log("Filtered Results:", filtered);
  };

  const handleViewResult = (resultId: string) => {
    router.push(`/teacher/results/${resultId}`);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-700 font-bold";
    if (percentage >= 75) return "text-green-600 font-semibold";
    if (percentage >= 60) return "text-yellow-600 font-semibold";
    if (percentage >= 50) return "text-orange-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const handleExportResults = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Test Results");

      // Set column widths
      worksheet.columns = [
        { header: "Student Name", key: "name", width: 25 },
        { header: "Student ID", key: "studentId", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Test Name", key: "testName", width: 30 },
        { header: "Subject", key: "subject", width: 20 },
        { header: "Total Questions", key: "totalQuestions", width: 18 },
        { header: "Correct Answers", key: "correctAnswers", width: 18 },
        { header: "Score (%)", key: "percentage", width: 12 },
        { header: "Submitted Date", key: "submittedDate", width: 20 },
        { header: "Submitted Time", key: "submittedTime", width: 15 },
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF6D28D9" }, // Violet color
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      // Add data rows
      filteredResults.forEach((result) => {
        const submittedDate = new Date(result.submittedAt);
        worksheet.addRow({
          name: result.student.name,
          studentId: result.student._id || "-",
          email: result.student.email,
          testName: result.test.title,
          subject: result.test.subject,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          percentage: result.percentage,
          submittedDate: submittedDate.toLocaleDateString(),
          submittedTime: submittedDate.toLocaleTimeString(),
        });
      });

      // Add borders and alignment to all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          if (rowNumber > 1) {
            cell.alignment = { vertical: "middle", horizontal: "left" };
          }
        });
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Test_Results_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export results:", error);
      alert("Failed to export results. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-violet-700 mb-2">
          Student Test Results
        </h1>
        <p className="text-sm text-muted-foreground">
          View and analyze student performance on completed tests
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Test:
          </label>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="px-3 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-violet-500 outline-none text-sm min-w-[200px]"
          >
            <option value="all">All Tests</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[250px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-input border border-border focus:ring-2 focus:ring-violet-500 outline-none text-sm"
            placeholder="Search by student name, email, or ID..."
          />
        </div>

        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportResults}
            disabled={filteredResults.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-semibold">{filteredResults.length}</span>{" "}
        of <span className="font-semibold">{results.length}</span> results
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="bg-white border border-border rounded-xl shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="bg-white border border-border rounded-xl shadow p-12 text-center">
          <p className="text-xl font-semibold text-muted-foreground mb-2">
            No Results Found
          </p>
          <p className="text-sm text-muted-foreground">
            {results.length === 0
              ? "No students have submitted tests yet."
              : "No results match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-violet-50 hover:bg-violet-50">
                <TableHead className="font-semibold text-violet-700">
                  Student Name
                </TableHead>
                <TableHead className="font-semibold text-violet-700">
                  Student ID
                </TableHead>
                <TableHead className="font-semibold text-violet-700">
                  Test Name
                </TableHead>
                <TableHead className="font-semibold text-violet-700 text-center">
                  Total Questions
                </TableHead>
                <TableHead className="font-semibold text-violet-700 text-center">
                  Correct
                </TableHead>
                <TableHead className="font-semibold text-violet-700 text-center">
                  Score
                </TableHead>
                <TableHead className="font-semibold text-violet-700">
                  Submitted
                </TableHead>
                <TableHead className="font-semibold text-violet-700 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow
                  key={result._id}
                  className="hover:bg-violet-50/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {result.student.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {result.student._id || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{result.test.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {result.test.subject}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {result.totalQuestions}
                  </TableCell>
                  <TableCell className="text-center">
                    {result.correctAnswers}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={getScoreColor(result.percentage)}>
                      {result.percentage}%
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(result.submittedAt).toLocaleDateString()}
                    <br />
                    <span className="text-xs">
                      {new Date(result.submittedAt).toLocaleTimeString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleViewResult(result._id)}
                      className="gap-2 bg-violet-600 hover:bg-violet-700"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

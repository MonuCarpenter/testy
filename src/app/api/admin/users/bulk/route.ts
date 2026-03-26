import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose-connect";
import { getAuthOrThrow } from "@/lib/with-auth";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";

const TEMPLATE_HEADERS = ["name", "email", "password", "role", "isActive"];

export async function GET() {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  const csv =
    TEMPLATE_HEADERS.join(",") +
    "\n" +
    [
      "Alice Admin,alice@example.com,Secret123,admin,true",
      "Tom Teacher,tom@example.com,Secret123,teacher,true",
      "Sara Student,sara@example.com,Secret123,student,true",
    ].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=users_template.csv",
    },
  });
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [] as any[];
  const headers = lines[0].split(",").map((h) => h.trim());
  const idx = (k: string) => headers.indexOf(k);
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    rows.push({
      name: cols[idx("name")]?.trim(),
      email: cols[idx("email")]?.trim(),
      password: cols[idx("password")]?.trim(),
      role: cols[idx("role")]?.trim() || "student",
      isActive:
        (cols[idx("isActive")] || "true").toString().toLowerCase() !== "false",
    });
  }
  return rows;
}

async function parseXlsx(file: File) {
  try {
    const ExcelJS = (await import("exceljs" as any)) as any;
    const wb = new (ExcelJS.Workbook as any)();
    const buffer = Buffer.from(await file.arrayBuffer());
    await wb.xlsx.load(buffer);
    const sheet = wb.worksheets[0];
    const rows: any[] = [];
    const headers = TEMPLATE_HEADERS;
    sheet.eachRow((row: any, rowNumber: number) => {
      if (rowNumber === 1) return; // skip header
      const get = (i: number) =>
        (row.getCell(i + 1).value ?? "").toString().trim();
      rows.push({
        name: get(0),
        email: get(1),
        password: get(2),
        role: get(3) || "student",
        isActive: (get(4) || "true").toLowerCase() !== "false",
      });
    });
    return rows;
  } catch (e) {
    throw new Error(
      "Excel parsing not available. Please install 'exceljs' or upload CSV instead."
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await getAuthOrThrow(["admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  let rows: any[] = [];
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".csv")) {
    const text = Buffer.from(await file.arrayBuffer()).toString("utf8");
    rows = parseCsv(text);
  } else if (lower.endsWith(".xlsx")) {
    rows = await parseXlsx(file);
  } else {
    return NextResponse.json(
      { error: "Unsupported format. Use CSV or XLSX" },
      { status: 400 }
    );
  }

  // Validate and prepare docs
  const docs: any[] = [];
  for (const r of rows) {
    if (!r.name || !r.email || !r.password) continue;
    const hashed = await hashPassword(r.password);
    docs.push({
      name: r.name,
      email: r.email,
      password: hashed,
      role: r.role || "student",
      isActive: !!r.isActive,
    });
  }
  if (docs.length === 0)
    return NextResponse.json({ error: "No valid rows" }, { status: 400 });

  // Insert while skipping duplicates by email
  const inserted: string[] = [];
  const skipped: string[] = [];
  for (const d of docs) {
    const exists = await User.findOne({ email: d.email });
    if (exists) {
      skipped.push(d.email);
      continue;
    }
    const created = await User.create(d);
    inserted.push(created.email);
  }

  return NextResponse.json({
    ok: true,
    inserted: inserted.length,
    skipped: skipped.length,
    skippedEmails: skipped.slice(0, 10),
  });
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose-connect";
import { getAuthOrThrow } from "@/lib/with-auth";
import Test from "@/models/Test";
import TermsTemplate from "@/models/TermsTemplate";

export async function GET(req: NextRequest) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const mine = req.nextUrl.searchParams.get("mine");
  const cond: any = {};
  if (mine) cond.teacher = auth.user.id;
  const tests = await Test.find(cond)
    .select(
      "title subject totalQuestions status createdAt startTime endTime durationMinutes"
    )
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(tests);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { title, subject, description, durationMinutes, startTime, endTime } =
    await req.json();
  if (!title || !subject)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Fetch teacher's terms template
  const termsTemplate = await TermsTemplate.findOne({
    teacher: auth.user.id,
  });

  // Create test with terms snapshot
  const doc = await Test.create({
    title,
    subject,
    description,
    durationMinutes: durationMinutes ?? 60,
    startTime,
    endTime,
    teacher: auth.user.id,
    testDate: startTime || new Date(),
    encryptionKey: "derived",
    status: "upcoming",
    termsTemplate: termsTemplate?._id || null,
    termsAndConditions: termsTemplate?.terms || [],
  } as any);
  return NextResponse.json({ id: doc._id });
}

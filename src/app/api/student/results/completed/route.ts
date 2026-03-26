import { NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import Result from "@/models/Result";

export async function GET() {
  const auth = await getAuthOrThrow("student");
  if ("error" in auth) return auth.error;
  await dbConnect();

  // Get all completed tests for this student
  const results = await Result.find({
    student: auth.user.id,
    testCompleted: true,
  })
    .populate("test", "title subject testDate")
    .select("_id test percentage correctAnswers totalQuestions submittedAt")
    .sort({ submittedAt: -1 })
    .lean();

  return NextResponse.json({ results });
}

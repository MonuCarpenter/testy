import { NextRequest, NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import Question from "@/models/Question";
import Test from "@/models/Test";
import { decryptString } from "@/lib/encryption";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ testId: string }> }
) {
  const auth = await getAuthOrThrow("student");
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { testId } = await ctx.params;
  const indexStr = req.nextUrl.searchParams.get("index") || "1";
  const index = Math.max(1, parseInt(indexStr));

  // Ensure this student is assigned to the test via Test.assignedStudents
  const test = await Test.findOne({
    _id: testId,
    assignedStudents: auth.user.id,
  }).lean();
  if (!test)
    return NextResponse.json({ error: "Not assigned" }, { status: 403 });

  const qs = await Question.findOne({ testId }).lean();
  if (!qs) return NextResponse.json({ error: "No questions" }, { status: 404 });

  const sub = (qs as any).questions.find(
    (q: any) => q.questionNumber === index
  );
  if (!sub)
    return NextResponse.json({ error: "Out of range" }, { status: 404 });

  const payload = {
    questionNumber: sub.questionNumber,
    question: decryptString(sub.encryptedQuestion),
    options: sub.encryptedOptions.map((s: string) => decryptString(s)),
    testTitle: test.title,
    totalQuestions: (qs as any).questions.length,
  };
  return NextResponse.json(payload);
}

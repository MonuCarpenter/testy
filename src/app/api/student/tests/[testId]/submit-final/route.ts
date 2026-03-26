import { NextRequest, NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import Result from "@/models/Result";
import Question from "@/models/Question";
import Test from "@/models/Test";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ testId: string }> }
) {
  const auth = await getAuthOrThrow("student");
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { testId } = await ctx.params;

  // ensure assigned
  const assigned = await Test.findOne({
    _id: testId,
    assignedStudents: auth.user.id,
  }).lean();
  if (!assigned)
    return NextResponse.json({ error: "Not assigned" }, { status: 403 });

  const resDoc = await Result.findOne({ student: auth.user.id, test: testId });
  if (!resDoc)
    return NextResponse.json({ error: "No answers" }, { status: 400 });

  const qs: any = await Question.findOne({ testId }).lean();
  if (!qs) return NextResponse.json({ error: "No questions" }, { status: 400 });

  let correct = 0;
  for (const ans of (resDoc.answers as any[]) || []) {
    const sub = (qs.questions as any[]).find(
      (q: any) => q.questionNumber === ans.questionNumber
    );
    if (sub && ans.chosenOption === sub.correctAnswerIndex) correct++;
    (ans as any).isCorrect = sub
      ? ans.chosenOption === sub.correctAnswerIndex
      : false;
  }
  resDoc.correctAnswers = correct;
  resDoc.totalQuestions = (qs.questions as any[]).length;
  resDoc.percentage = resDoc.totalQuestions
    ? Math.round((correct / resDoc.totalQuestions) * 100)
    : 0;
  resDoc.testCompleted = true;
  (resDoc as any).submittedAt = new Date();
  await resDoc.save();

  return NextResponse.json({
    ok: true,
    resultId: resDoc._id,
    percentage: resDoc.percentage,
  });
}

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
  const { questionNumber, chosenOption, timeTakenSec } = await req.json();

  // ensure assigned
  const assigned = await Test.findOne({
    _id: testId,
    assignedStudents: auth.user.id,
  }).lean();
  if (!assigned)
    return NextResponse.json({ error: "Not assigned" }, { status: 403 });

  let resDoc = await Result.findOne({ student: auth.user.id, test: testId });
  if (!resDoc) {
    const qs = await Question.findOne({ testId }).lean();
    const totalQuestions = qs ? (qs as any).questions.length : 0;
    resDoc = await Result.create({
      student: auth.user.id,
      test: testId,
      totalQuestions,
      correctAnswers: 0,
      percentage: 0,
      answers: [],
    });
  }

  const answers = (resDoc.answers as any[]) || [];
  const existing = answers.find((a) => a.questionNumber === questionNumber);
  if (existing) {
    existing.chosenOption = chosenOption;
    existing.timeTakenSec = timeTakenSec;
  } else {
    answers.push({ questionNumber, chosenOption, timeTakenSec });
  }
  resDoc.answers = answers as any;
  await resDoc.save();
  return NextResponse.json({ ok: true, id: resDoc._id });
}

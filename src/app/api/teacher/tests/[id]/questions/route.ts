import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose-connect";
import { getAuthOrThrow } from "@/lib/with-auth";
import Question from "@/models/Question";
import Test from "@/models/Test";
import { decryptString, encryptString } from "@/lib/encryption";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { id } = await ctx.params;
  if (auth.user.role === "teacher") {
    const test = await Test.findOne({ _id: id, teacher: auth.user.id }).lean();
    if (!test)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const qs: any = await Question.findOne({ testId: id }).lean();
  if (!qs) return NextResponse.json({ questions: [] });
  const list = (qs.questions || []).map((q: any) => ({
    questionNumber: q.questionNumber,
    question: decryptString(q.encryptedQuestion),
    options: q.encryptedOptions.map((s: string) => decryptString(s)),
    answerIndex: q.correctAnswerIndex,
  }));
  return NextResponse.json({ questions: list });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { id } = await ctx.params;
  if (auth.user.role === "teacher") {
    const test = await Test.findOne({ _id: id, teacher: auth.user.id }).lean();
    if (!test)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { questionNumber, question, options, answerIndex } = await req.json();
  if (
    !questionNumber ||
    !question ||
    !Array.isArray(options) ||
    options.length !== 4
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  let doc: any = await Question.findOne({ testId: id });
  if (!doc) {
    doc = await Question.create({
      testId: id,
      subject: "",
      questions: [],
    } as any);
  }
  const idx = (doc.questions as any[]).findIndex(
    (q: any) => q.questionNumber === questionNumber
  );
  const payload = {
    questionNumber,
    encryptedQuestion: encryptString(question),
    encryptedOptions: options.map((s: string) => encryptString(s)),
    correctAnswerIndex: typeof answerIndex === "number" ? answerIndex : 0,
  } as any;
  if (idx >= 0) {
    (doc.questions as any[])[idx] = {
      ...(doc.questions as any[])[idx],
      ...payload,
    };
  } else {
    (doc.questions as any[]).push(payload);
  }
  (doc.questions as any[]).sort(
    (a: any, b: any) => a.questionNumber - b.questionNumber
  );
  await doc.save();
  await Test.findByIdAndUpdate(id, {
    $set: { totalQuestions: (doc.questions as any[]).length },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthOrThrow(["teacher", "admin", "superadmin"]);
  if ("error" in auth) return auth.error;
  await dbConnect();
  const { id } = await ctx.params;
  const { questionNumber } = await req.json();
  if (auth.user.role === "teacher") {
    const test = await Test.findOne({ _id: id, teacher: auth.user.id }).lean();
    if (!test)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const doc: any = await Question.findOne({ testId: id });
  if (!doc) return NextResponse.json({ ok: true });
  doc.questions = (doc.questions as any[]).filter(
    (q: any) => q.questionNumber !== questionNumber
  );
  await doc.save();
  await Test.findByIdAndUpdate(id, {
    $set: { totalQuestions: (doc.questions as any[]).length },
  });
  return NextResponse.json({ ok: true });
}

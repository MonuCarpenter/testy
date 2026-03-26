import { NextRequest, NextResponse } from "next/server";
import { getAuthOrThrow } from "@/lib/with-auth";
import dbConnect from "@/lib/mongoose-connect";
import Result from "@/models/Result";
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

  // Verify the student was assigned to this test
  const test = await Test.findOne({
    _id: testId,
    assignedStudents: auth.user.id,
  })
    .select("title subject")
    .lean();

  if (!test) {
    return NextResponse.json(
      { error: "You are not assigned to this test" },
      { status: 403 }
    );
  }

  // Check if the student completed this test
  const result = await Result.findOne({
    student: auth.user.id,
    test: testId,
    testCompleted: true,
  }).lean();

  if (!result) {
    return NextResponse.json(
      { error: "You haven't completed this test yet" },
      { status: 403 }
    );
  }

  // Get all questions for this test
  const questionDoc = await Question.findOne({ testId }).lean();
  if (!questionDoc) {
    return NextResponse.json({ error: "No questions found" }, { status: 404 });
  }

  // Decrypt questions and match with student's answers
  const questions = (questionDoc as any).questions || [];
  const studentAnswers = (result.answers as any[]) || [];

  const reviewData = questions.map((q: any) => {
    const studentAnswer = studentAnswers.find(
      (a) => a.questionNumber === q.questionNumber
    );

    return {
      questionNumber: q.questionNumber,
      question: decryptString(q.encryptedQuestion),
      options: q.encryptedOptions.map((opt: string) => decryptString(opt)),
      correctAnswerIndex: q.correctAnswerIndex,
      studentAnswerIndex: studentAnswer?.chosenOption ?? null,
      isCorrect: studentAnswer?.isCorrect ?? false,
      explanation: q.explanation || null,
    };
  });

  return NextResponse.json({
    testTitle: test.title,
    testSubject: test.subject,
    totalQuestions: questions.length,
    correctAnswers: result.correctAnswers,
    percentage: result.percentage,
    questions: reviewData,
  });
}

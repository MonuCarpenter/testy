import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  percentage: { type: Number, required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      questionNumber: { type: Number, required: true }, // reference question number
      chosenOption: { type: Number }, // index of chosen option (0-3 for A-D)
      isCorrect: { type: Boolean },
      timeTakenSec: { type: Number }, // time taken for this question
    },
  ],
  resultViewed: { type: Boolean, default: false }, // one-time viewing control
  viewedAt: { type: Date }, // timestamp when viewed by student
  testCompleted: { type: Boolean, default: false }, // whether test was completed
  autoSubmitted: { type: Boolean, default: false }, // if test was auto-submitted on timeout
  submittedAt: { type: Date, default: Date.now },
});

const Result = mongoose.models.Result || mongoose.model("Result", ResultSchema);

export default Result;

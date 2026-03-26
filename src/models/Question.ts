import mongoose from "mongoose";

const QuestionSubSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  encryptedQuestion: { type: String, required: true }, // AES-256 encrypted
  encryptedOptions: [{ type: String, required: true }], // AES-256 encrypted
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String }, // optional explanation for students
  createdAt: { type: Date, default: Date.now },
});

const QuestionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  subject: { type: String, required: true },
  questions: [QuestionSubSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadedFileName: { type: String }, // track source file (Word or PPT)
  uploadedAt: { type: Date },
  fileType: { type: String, enum: ["word", "powerpoint", "txt", null] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Question = mongoose.models.Question || mongoose.model("Question", QuestionSchema);

export default Question;

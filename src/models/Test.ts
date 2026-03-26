import mongoose from "mongoose";

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  totalQuestions: { type: Number, default: 0 },
  testDate: { type: Date, required: true }, // assigned date
  startTime: { type: Date, required: false }, // when test becomes available
  endTime: { type: Date, required: false }, // when test auto-closes
  durationMinutes: { type: Number, default: 60 },
  termsTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TermsTemplate",
  }, // Reference to teacher's terms template
  termsAndConditions: [{ type: String, maxLength: 200 }], // Snapshot of terms at test creation time
  encryptionKey: { type: String, required: true }, // AES-256 key for questions
  subjectFolder: { type: String }, // folder path for storing questions
  fileType: { type: String, enum: ["word", "powerpoint", null], default: null }, // uploaded format
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Test = mongoose.models.Test || mongoose.model("Test", TestSchema);

export default Test;

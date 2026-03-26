import mongoose from "mongoose";

const TermsTemplateSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true, // Each teacher has only one terms template
  },
  terms: [
    {
      type: String,
      maxLength: 200,
    },
  ], // Array of term/condition strings (max 10 items)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt timestamp before saving
TermsTemplateSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const TermsTemplate =
  mongoose.models.TermsTemplate ||
  mongoose.model("TermsTemplate", TermsTemplateSchema);

export default TermsTemplate;

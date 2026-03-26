import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed using bcrypt
  role: {
    type: String,
    enum: ["superadmin", "admin", "teacher", "student"],
    required: true,
  },
  studentId: { type: String, unique: true, sparse: true }, // for students only, must be unique
  subjects: [{ type: String }], // subjects handled (for teachers)
  assignedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }], // for students
  createdTests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }], // for teachers
  isActive: { type: Boolean, default: true }, // for suspending/reactivating accounts
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // track who created the user (admin)
  suspendedAt: { type: Date }, // when account was suspended
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who suspended the account
  dateJoined: { type: Date, default: Date.now },
  lastLogin: { type: Date },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;

import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureTitle: { type: String, required: true },
  description: String,
  duration: Number,
  videoUrl: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
}, { timestamps: true });

// ✅ Use existing model if already compiled, otherwise compile new
const Lecture = mongoose.models.Lecture || mongoose.model("Lecture", lectureSchema);

export default Lecture;

import { Schema, model } from "mongoose";

const LectureProgressSchema = new Schema({
  lectureId: String,
  viewed: Boolean,
  dateViewed: Date,
  downloaded: Boolean,
  dateDownloaded: Date
}, {timestamps:true});

const CourseProgressSchema = new Schema({
  userId: String,
  courseId: String,
  completed: Boolean,
  completionDate: Date,
  lecturesProgress: [LectureProgressSchema],
}, {timestamps:true});

export default model("Progress", CourseProgressSchema);

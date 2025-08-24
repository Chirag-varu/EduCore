import { Schema, model } from "mongoose";

const StudentCoursesSchema = new Schema({
  userId: String,
  courses: [
    {
      courseId: String,
      title: String,
      instructorId: String,
      instructorName: String,
      dateOfPurchase: Date,
      courseImage: String,
    },
  ],
});

export const StudentCourses =  model("StudentCourses", StudentCoursesSchema);

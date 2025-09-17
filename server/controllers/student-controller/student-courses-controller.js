// controller/student-courses-controller.js
import { StudentCourses } from "../../models/StudentCourses.js";
import Course from "../../models/Course.js";
import mongoose from "mongoose";

const getCoursesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const studentBoughtCourses = await StudentCourses.findOne({
      userId: studentId,
    });

    res.status(200).json({
      success: true,
      data: studentBoughtCourses ? studentBoughtCourses.courses : [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// Check if a student has access to a specific course
const checkStudentCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id; // From auth middleware
    
    // Check if the user is enrolled through StudentCourses collection
    const studentCourses = await StudentCourses.findOne({
      userId,
      courses: { $elemMatch: { courseId } }
    });
    
    // Also check if the user is in the course's enrolledStudents
    const course = await Course.findOne({
      _id: mongoose.Types.ObjectId.createFromHexString(courseId),
      enrolledStudents: { $elemMatch: { $eq: userId } }
    });
    
    const hasAccess = Boolean(studentCourses || course);
    
    res.status(200).json({
      success: true,
      data: hasAccess,
      message: hasAccess 
        ? "User has access to this course" 
        : "User does not have access to this course"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error checking course access",
    });
  }
};

// Export all functions
export default {
  getCoursesByStudentId,
  checkStudentCourseAccess
};

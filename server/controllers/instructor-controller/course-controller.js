import Course from "../../models/Course.js";
import User from "../../models/User.js";
import mongoose from "mongoose";

const addNewCourse = async (req, res) => {
  try {
    const courseData = req.body;
    console.log("Received course data:", courseData);

    const newlyCreatedCourse = new Course(courseData);
    const saveCourse = await newlyCreatedCourse.save();

    if (saveCourse) {
      res.status(201).json({
        success: true,
        message: "Course saved successfully",
        data: saveCourse,
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const coursesList = await Course.find({});

    res.status(200).json({
      success: true,
      data: coursesList,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getCourseDetailsByID = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const updateCourseByID = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCourseData = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updatedCourseData,
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getStudentdetails = async (req, res) => {
  try {
    const { id } = req.params;
    const studentDetails = await User.findById(id)
      .where("role")
      .equals("student")
      .select("-password  -role -__v");

    if (!studentDetails) {
      return res.status(404).json({
        success: false,
        message: "No Student details found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: studentDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured in getting student Details!",
    });
  }
};

// Get instructor profile and their courses
const getInstructorProfileAndCourses = async (req, res) => {
  try {
    const { id } = req.params;
    // Find instructor details
    const instructor = await User.findById(id)
      .where("role").equals("instructor")
      .select("-password -__v");
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found!",
      });
    }
  // Find all courses by this instructor
  // const courses = await Course.find({ instructorId: mongoose.Types.ObjectId(id) });
  const courses = await Course.find({ instructorId: id });
    res.status(200).json({
      success: true,
      instructor,
      courses,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

export default {
  addNewCourse,
  getAllCourses,
  updateCourseByID,
  getCourseDetailsByID,
  getStudentdetails,
  getInstructorProfileAndCourses,
};

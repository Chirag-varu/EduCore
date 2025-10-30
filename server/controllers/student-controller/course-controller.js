import Course from "../../models/Course.js";
import StudentCourses from "../../models/StudentCourses.js";
import Lecture from "../../models/lecture.model.js";
import { cacheQuery, generateCoursesCacheKey, monitorQuery } from "../../helpers/performance.js";

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category = "",
      level = "",
      primaryLanguage = "",
      sortBy = "price-lowtohigh",
      page = 1,
      limit = 10,
    } = req.query;

    let filters = {};

    if (category) {
      const arr = category.split(",").filter(Boolean);
      if (arr.length) filters.category = { $in: arr };
    }

    if (level) {
      const arr = level.split(",").filter(Boolean);
      if (arr.length) filters.level = { $in: arr };
    }

    if (primaryLanguage) {
      const arr = primaryLanguage.split(",").filter(Boolean);
      if (arr.length) {
        // Check both primaryLanguage and language fields for backward compatibility
        filters.$or = [
          { primaryLanguage: { $in: arr } },
          { language: { $in: arr } }
        ];
      }
    }

    let sortParam = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sortParam.price = 1;
        break;
      case "price-hightolow":
        sortParam.price = -1;
        break;
      case "title-atoz":
        sortParam.title = 1;
        break;
      case "title-ztoa":
        sortParam.title = -1;
        break;
      default:
        sortParam.price = 1;
    }

    const skip = (page - 1) * limit;
    
    // Use caching for course listing (5 minute cache)
    const cacheKey = generateCoursesCacheKey(filters, sortParam, page, limit);
    const coursesList = await cacheQuery(
      cacheKey,
      async () => {
        return await monitorQuery(
          'getAllStudentViewCourses',
          () => Course.find(filters)
            .sort(sortParam)
            .skip(skip)
            .limit(Number(limit))
        );
      },
      300 // 5 minutes TTL
    );

    res.status(200).json({
      success: true,
      data: coursesList,
      pagination: { page: Number(page), limit: Number(limit) },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "No course details found",
        data: null,
      });
    }

    const lectures = await Lecture.find({
      _id: { $in: courseDetails.curriculum },
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: courseDetails,
      lectures
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const checkCoursePurchaseInfo = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const studentCourses = await StudentCourses.findOne({
      userId: studentId,
    });

    const ifStudentAlreadyBoughtCurrentCourse =
      studentCourses?.courses.find((item) => item.courseId === id) > -1;
    res.status(200).json({
      success: true,
      data: ifStudentAlreadyBoughtCurrentCourse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

export default {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
  checkCoursePurchaseInfo,
};

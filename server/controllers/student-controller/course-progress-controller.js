import CourseProgress from "../../models/CourseProgress.js";
import Course from "../../models/Course.js";
import Lecture from "../../models/lecture.model.js";
import StudentCourses from "../../models/StudentCourses.js";

// mark current lecture as viewed
const markCurrentLectureAsViewed = async (req, res) => {
  try {
    const { userId, courseId, lectureId } = req.body;

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        lecturesProgress: [{ lectureId, viewed: true, dateViewed: new Date() }],
      });
      await progress.save();
    } else {
      const lectureProgress = progress.lecturesProgress.find(
        (item) => String(item.lectureId) === String(lectureId)
      );

      if (lectureProgress) {
        lectureProgress.viewed = true;
        lectureProgress.dateViewed = new Date();
      } else {
        progress.lecturesProgress.push({
          lectureId,
          viewed: true,
          dateViewed: new Date(),
        });
      }
      await progress.save();
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // check if all lectures are viewed
    const allLecturesViewed =
      progress.lecturesProgress.length === course.curriculum.length &&
      progress.lecturesProgress.every((item) => item.viewed);

    if (allLecturesViewed) {
      progress.completed = true;
      progress.completionDate = new Date();
      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: "Lecture marked as viewed",
      data: progress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// get current course progress
const getCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const studentPurchasedCourses = await StudentCourses.findOne({ userId });

    const isPurchased = studentPurchasedCourses?.courses?.some(
      (item) => String(item.courseId) === String(courseId)
    );

    if (!isPurchased) {
      return res.status(200).json({
        success: true,
        data: { isPurchased: false },
        message: "You need to purchase this course to access it.",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const lectures = await Lecture.find({
      _id: { $in: course.curriculum },
    }).sort({ createdAt: 1 });

    const currentUserCourseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (
      !currentUserCourseProgress ||
      currentUserCourseProgress.lecturesProgress.length === 0
    ) {
      return res.status(200).json({
        success: true,
        message: "No progress found, you can start watching the course",
        data: {
          courseDetails: course,
          lectures,
          progress: [],
          isPurchased: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        courseDetails: course,
        lectures,
        progress: currentUserCourseProgress.lecturesProgress,
        completed: currentUserCourseProgress.completed,
        completionDate: currentUserCourseProgress.completionDate,
        isPurchased: true,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// reset course progress
const resetCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress) {
      return res
        .status(404)
        .json({ success: false, message: "Progress not found!" });
    }

    progress.lecturesProgress = [];
    progress.completed = false;
    progress.completionDate = null;

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Course progress has been reset",
      data: progress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

export default {
  markCurrentLectureAsViewed,
  getCurrentCourseProgress,
  resetCurrentCourseProgress,
  // New API v2 (auth-derived)
  getCourseProgressSummary: async (req, res) => {
    try {
      const userId = req?.user?._id || req?.user?.userId;
      const { courseId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }

      // Validate purchase
      const studentPurchasedCourses = await StudentCourses.findOne({ userId: String(userId) });
      const isPurchased = studentPurchasedCourses?.courses?.some(
        (item) => String(item.courseId) === String(courseId)
      );
      if (!isPurchased) {
        return res.status(403).json({ success: false, message: "Access denied. Course not purchased." });
      }

      const totalLectures = Array.isArray(course.curriculum) ? course.curriculum.length : 0;
      const progressDoc = await CourseProgress.findOne({ userId: String(userId), courseId: String(courseId) });

      const lecturesProgress = progressDoc?.lecturesProgress || [];
      const viewedSet = new Set(
        lecturesProgress
          .filter((lp) => lp.viewed)
          .map((lp) => String(lp.lectureId))
      );

      const viewedLectures = Array.isArray(course.curriculum)
        ? course.curriculum.filter((id) => viewedSet.has(String(id))).length
        : 0;

      const percentage = totalLectures > 0 ? Number(((viewedLectures / totalLectures) * 100).toFixed(1)) : 0;

      return res.status(200).json({
        success: true,
        data: {
          userId: String(userId),
          courseId: String(courseId),
          totalLectures,
          viewedLectures,
          percentage,
          completed: !!progressDoc?.completed,
          completionDate: progressDoc?.completionDate || null,
          lecturesProgress,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Some error occurred!" });
    }
  },
  updateLectureProgress: async (req, res) => {
    try {
      const userId = req?.user?._id || req?.user?.userId;
      const { courseId, lectureId } = req.params;
      const { viewed } = req.body || {};

      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
      if (typeof viewed !== "boolean") {
        return res.status(400).json({ success: false, message: "`viewed` boolean is required" });
      }

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });

      // Validate lecture belongs to course
      const inCurriculum = (course.curriculum || []).some((id) => String(id) === String(lectureId));
      if (!inCurriculum) {
        return res.status(409).json({ success: false, message: "Lecture does not belong to the course" });
      }

      // Validate purchase
      const studentPurchasedCourses = await StudentCourses.findOne({ userId: String(userId) });
      const isPurchased = studentPurchasedCourses?.courses?.some(
        (item) => String(item.courseId) === String(courseId)
      );
      if (!isPurchased) {
        return res.status(403).json({ success: false, message: "Access denied. Course not purchased." });
      }

      let progress = await CourseProgress.findOne({ userId: String(userId), courseId: String(courseId) });
      if (!progress) {
        progress = new CourseProgress({
          userId: String(userId),
          courseId: String(courseId),
          lecturesProgress: [],
          completed: false,
        });
      }

      const existing = progress.lecturesProgress.find((lp) => String(lp.lectureId) === String(lectureId));
      if (existing) {
        existing.viewed = viewed;
        existing.dateViewed = viewed ? new Date() : null;
      } else {
        progress.lecturesProgress.push({ lectureId: String(lectureId), viewed, dateViewed: viewed ? new Date() : null });
      }

      // Recompute completion
      const totalLectures = Array.isArray(course.curriculum) ? course.curriculum.length : 0;
      const viewedCount = progress.lecturesProgress.filter((lp) => lp.viewed && (course.curriculum || []).some((id) => String(id) === String(lp.lectureId))).length;
      const allViewed = totalLectures > 0 && viewedCount === totalLectures;
      progress.completed = allViewed;
      progress.completionDate = allViewed ? (progress.completionDate || new Date()) : null;

      await progress.save();

      const percentage = totalLectures > 0 ? Number(((viewedCount / totalLectures) * 100).toFixed(1)) : 0;

      return res.status(200).json({
        success: true,
        data: {
          userId: String(userId),
          courseId: String(courseId),
          totalLectures,
          viewedLectures: viewedCount,
          percentage,
          completed: progress.completed,
          completionDate: progress.completionDate,
          lecturesProgress: progress.lecturesProgress,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Some error occurred!" });
    }
  },
  resetCourseProgressV2: async (req, res) => {
    try {
      const userId = req?.user?._id || req?.user?.userId;
      const { courseId } = req.params;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ success: false, message: "Course not found" });

      // Validate purchase
      const studentPurchasedCourses = await StudentCourses.findOne({ userId: String(userId) });
      const isPurchased = studentPurchasedCourses?.courses?.some(
        (item) => String(item.courseId) === String(courseId)
      );
      if (!isPurchased) {
        return res.status(403).json({ success: false, message: "Access denied. Course not purchased." });
      }

      const progress = await CourseProgress.findOne({ userId: String(userId), courseId: String(courseId) });
      if (!progress) {
        // Nothing to reset; return empty summary
        return res.status(200).json({
          success: true,
          data: {
            userId: String(userId),
            courseId: String(courseId),
            totalLectures: Array.isArray(course.curriculum) ? course.curriculum.length : 0,
            viewedLectures: 0,
            percentage: 0,
            completed: false,
            completionDate: null,
            lecturesProgress: [],
          },
        });
      }

      progress.lecturesProgress = [];
      progress.completed = false;
      progress.completionDate = null;
      await progress.save();

      return res.status(200).json({
        success: true,
        data: {
          userId: String(userId),
          courseId: String(courseId),
          totalLectures: Array.isArray(course.curriculum) ? course.curriculum.length : 0,
          viewedLectures: 0,
          percentage: 0,
          completed: false,
          completionDate: null,
          lecturesProgress: [],
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Some error occurred!" });
    }
  },
};

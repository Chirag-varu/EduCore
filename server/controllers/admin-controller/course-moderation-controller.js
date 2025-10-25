import Course from "../../models/Course.js";
import User from "../../models/User.js";
import StudentCourses from "../../models/StudentCourses.js";

// Get all courses for moderation
export const getCoursesForModeration = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '', 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build filter query
    const filter = {};
    if (status && status !== 'all') {
      filter.isPublished = status === 'published';
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get courses with instructor details
    const courses = await Course.find(filter)
      .populate('instructorId', 'userName userEmail')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(filter);

    // Get course statistics
    const stats = await Course.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: { $sum: { $cond: ['$isPublished', 1, 0] } },
          draft: { $sum: { $cond: ['$isPublished', 0, 1] } },
          averagePrice: { $avg: '$pricing' }
        }
      }
    ]);

    const courseStats = stats[0] || {
      total: 0,
      published: 0,
      draft: 0,
      averagePrice: 0
    };

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCourses / parseInt(limit)),
          totalCourses,
          limit: parseInt(limit)
        },
        stats: courseStats
      }
    });
  } catch (error) {
    console.error('Error fetching courses for moderation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses for moderation',
      error: error.message
    });
  }
};

// Get detailed course information for moderation
export const getCourseDetailsForModeration = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('instructorId', 'userName userEmail')
      .populate('curriculum.lectures');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollment statistics
    const enrollmentCount = await StudentCourses.countDocuments({
      courses: courseId
    });

    // Get course completion statistics
    const completionStats = await StudentCourses.aggregate([
      { $match: { courses: courseId } },
      { $unwind: '$courseProgress' },
      { $match: { 'courseProgress.courseId': courseId } },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: '$courseProgress.completionPercentage' },
          totalStudents: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      enrollments: enrollmentCount,
      averageProgress: completionStats[0]?.averageProgress || 0,
      totalStudents: completionStats[0]?.totalStudents || 0
    };

    res.status(200).json({
      success: true,
      data: {
        course,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching course details for moderation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course details for moderation',
      error: error.message
    });
  }
};

// Approve course
export const approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { adminNote } = req.body;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { 
        isPublished: true,
        moderationStatus: 'approved',
        adminNote: adminNote || '',
        approvedAt: new Date(),
        approvedBy: req.user.userId
      },
      { new: true }
    ).populate('instructorId', 'userName userEmail');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // TODO: Send notification to instructor about approval
    // You can implement email notification here

    res.status(200).json({
      success: true,
      message: 'Course approved successfully',
      data: course
    });
  } catch (error) {
    console.error('Error approving course:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving course',
      error: error.message
    });
  }
};

// Reject course
export const rejectCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { adminNote, reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      { 
        isPublished: false,
        moderationStatus: 'rejected',
        adminNote: adminNote || '',
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy: req.user.userId
      },
      { new: true }
    ).populate('instructorId', 'userName userEmail');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // TODO: Send notification to instructor about rejection
    // You can implement email notification here

    res.status(200).json({
      success: true,
      message: 'Course rejected successfully',
      data: course
    });
  } catch (error) {
    console.error('Error rejecting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting course',
      error: error.message
    });
  }
};

// Toggle course publication status
export const toggleCoursePublication = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { isPublished } = req.body;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { 
        isPublished,
        moderationStatus: isPublished ? 'approved' : 'pending'
      },
      { new: true }
    ).populate('instructorId', 'userName userEmail');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Course ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: course
    });
  } catch (error) {
    console.error('Error toggling course publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling course publication',
      error: error.message
    });
  }
};

// Delete course (admin only)
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course has enrollments
    const enrollmentCount = await StudentCourses.countDocuments({
      courses: courseId
    });

    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with existing enrollments'
      });
    }

    const course = await Course.findByIdAndDelete(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// Get moderation queue summary
export const getModerationSummary = async (req, res) => {
  try {
    const summary = await Course.aggregate([
      {
        $group: {
          _id: '$moderationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const pendingCount = summary.find(s => s._id === 'pending')?.count || 0;
    const approvedCount = summary.find(s => s._id === 'approved')?.count || 0;
    const rejectedCount = summary.find(s => s._id === 'rejected')?.count || 0;

    // Get recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSubmissions = await Course.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
        recentSubmissions
      }
    });
  } catch (error) {
    console.error('Error fetching moderation summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching moderation summary',
      error: error.message
    });
  }
};
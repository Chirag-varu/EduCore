import User from "../../models/User.js";
import Course from "../../models/Course.js";
import StudentCourses from "../../models/StudentCourses.js";
import Order from "../../models/Order.js";
import CourseProgress from "../../models/CourseProgress.js";

// Get enhanced instructor analytics
export const getInstructorAnalytics = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { timeframe = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // Get instructor's courses
    const courses = await Course.find({ instructorId })
      .select('_id title pricing createdAt isPublished');

    const courseIds = courses.map(course => course._id);

    // Revenue analytics
    const revenueData = await Order.aggregate([
      { 
        $match: { 
          courseId: { $in: courseIds.map(id => id.toString()) },
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            courseId: '$courseId'
          },
          revenue: { $sum: '$coursePricing' },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Course performance metrics
    const coursePerformance = await Promise.all(
      courses.map(async (course) => {
        // Get enrollment count
        const enrollmentCount = await Order.countDocuments({
          courseId: course._id.toString()
        });

        // Get completion statistics
        const completionStats = await CourseProgress.aggregate([
          { $match: { courseId: course._id } },
          {
            $group: {
              _id: null,
              averageProgress: { $avg: '$completionPercentage' },
              completedStudents: {
                $sum: { $cond: [{ $gte: ['$completionPercentage', 100] }, 1, 0] }
              },
              totalStudents: { $sum: 1 }
            }
          }
        ]);

        const stats = completionStats[0] || {
          averageProgress: 0,
          completedStudents: 0,
          totalStudents: 0
        };

        // Get recent revenue (last 30 days)
        const recentRevenue = await Order.aggregate([
          { 
            $match: { 
              courseId: course._id.toString(),
              createdAt: { $gte: startDate }
            } 
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$coursePricing' }
            }
          }
        ]);

        return {
          _id: course._id,
          title: course.title,
          price: course.pricing,
          isPublished: course.isPublished,
          enrollments: enrollmentCount,
          revenue: enrollmentCount * (course.pricing || 0),
          recentRevenue: recentRevenue[0]?.total || 0,
          completionRate: stats.totalStudents > 0 ? 
            Math.round((stats.completedStudents / stats.totalStudents) * 100) : 0,
          averageProgress: Math.round(stats.averageProgress || 0),
          totalStudents: stats.totalStudents
        };
      })
    );

    // Student engagement metrics
    const studentEngagement = await CourseProgress.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      {
        $group: {
          _id: '$courseId',
          averageProgress: { $avg: '$completionPercentage' },
          totalStudents: { $sum: 1 },
          activeStudents: {
            $sum: { $cond: [{ $gt: ['$completionPercentage', 0] }, 1, 0] }
          }
        }
      }
    ]);

    // Top performing courses
    const topCourses = coursePerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate totals
    const totals = {
      totalRevenue: coursePerformance.reduce((sum, course) => sum + course.revenue, 0),
      totalEnrollments: coursePerformance.reduce((sum, course) => sum + course.enrollments, 0),
      totalStudents: new Set(
        await Order.find({ courseId: { $in: courseIds.map(id => id.toString()) } })
          .distinct('userId')
      ).size,
      activeCourses: courses.filter(course => course.isPublished).length,
      averageCompletionRate: coursePerformance.length > 0 ?
        Math.round(
          coursePerformance.reduce((sum, course) => sum + course.completionRate, 0) / 
          coursePerformance.length
        ) : 0
    };

    // Recent enrollments trend
    const enrollmentTrend = await Order.aggregate([
      { 
        $match: { 
          courseId: { $in: courseIds.map(id => id.toString()) },
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          enrollments: { $sum: 1 },
          revenue: { $sum: '$coursePricing' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totals,
        coursePerformance,
        topCourses,
        revenueData,
        enrollmentTrend,
        studentEngagement
      }
    });
  } catch (error) {
    console.error('Error fetching instructor analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching instructor analytics',
      error: error.message
    });
  }
};

// Get detailed course analytics
export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { instructorId } = req.user;

    // Verify course ownership
    const course = await Course.findOne({ _id: courseId, instructorId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or access denied'
      });
    }

    // Get enrollment analytics
    const enrollments = await Order.find({ courseId: courseId.toString() })
      .populate('userId', 'userName userEmail createdAt')
      .sort({ createdAt: -1 });

    // Get student progress data
    const studentProgress = await CourseProgress.find({ courseId })
      .populate('userId', 'userName userEmail');

    // Get completion statistics by lecture
    const lectureProgress = await CourseProgress.aggregate([
      { $match: { courseId: course._id } },
      { $unwind: '$lecturesProgress' },
      {
        $group: {
          _id: '$lecturesProgress.lectureId',
          completedCount: {
            $sum: { $cond: ['$lecturesProgress.viewed', 1, 0] }
          },
          totalStudents: { $sum: 1 }
        }
      },
      {
        $addFields: {
          completionRate: {
            $multiply: [
              { $divide: ['$completedCount', '$totalStudents'] },
              100
            ]
          }
        }
      }
    ]);

    // Revenue over time
    const revenueOverTime = await Order.aggregate([
      { $match: { courseId: courseId.toString() } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$coursePricing' },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Student engagement metrics
    const engagementMetrics = {
      totalEnrollments: enrollments.length,
      averageProgress: studentProgress.length > 0 ?
        Math.round(
          studentProgress.reduce((sum, progress) => sum + progress.completionPercentage, 0) /
          studentProgress.length
        ) : 0,
      completedStudents: studentProgress.filter(p => p.completionPercentage >= 100).length,
      activeStudents: studentProgress.filter(p => p.completionPercentage > 0).length,
      totalRevenue: enrollments.reduce((sum, enrollment) => sum + (enrollment.coursePricing || 0), 0)
    };

    res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          price: course.pricing,
          createdAt: course.createdAt
        },
        engagementMetrics,
        enrollments,
        studentProgress,
        lectureProgress,
        revenueOverTime
      }
    });
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course analytics',
      error: error.message
    });
  }
};

// Get student details for instructor
export const getStudentDetailsForInstructor = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { instructorId } = req.user;

    // Verify course ownership
    const course = await Course.findOne({ _id: courseId, instructorId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or access denied'
      });
    }

    // Get student details
    const student = await User.findById(studentId).select('-password -resetToken');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student's progress in this course
    const progress = await CourseProgress.findOne({ 
      userId: studentId, 
      courseId 
    });

    // Get enrollment details
    const enrollment = await Order.findOne({ 
      userId: studentId, 
      courseId: courseId.toString() 
    });

    res.status(200).json({
      success: true,
      data: {
        student,
        progress: progress || { completionPercentage: 0, lecturesProgress: [] },
        enrollment,
        course: {
          _id: course._id,
          title: course.title
        }
      }
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student details',
      error: error.message
    });
  }
};
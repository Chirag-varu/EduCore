import User from "../../models/User.js";
import Course from "../../models/Course.js";
import StudentCourses from "../../models/StudentCourses.js";
import Order from "../../models/Order.js";

// Get all users with pagination and filtering
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role = '', 
      search = '', 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build filter query
    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -resetToken')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);

    // Get user statistics
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const userStats = {
      total: totalUsers,
      students: stats.find(s => s._id === 'student')?.count || 0,
      instructors: stats.find(s => s._id === 'instructor')?.count || 0,
      admins: stats.find(s => s._id === 'admin')?.count || 0
    };

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          limit: parseInt(limit)
        },
        stats: userStats
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user details with related data
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -resetToken');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let additionalData = {};

    if (user.role === 'instructor') {
      // Get instructor's courses
      const courses = await Course.find({ instructorId: userId });
      
      // Get enrollment statistics
      const enrollmentStats = await StudentCourses.aggregate([
        { $match: { courses: { $in: courses.map(c => c._id) } } },
        { $unwind: '$courses' },
        { $match: { courses: { $in: courses.map(c => c._id) } } },
        { $group: { _id: '$courses', enrollments: { $sum: 1 } } }
      ]);

      const totalRevenue = await Order.aggregate([
        { $match: { courseId: { $in: courses.map(c => c._id.toString()) } } },
        { $group: { _id: null, total: { $sum: '$coursePricing' } } }
      ]);

      additionalData = {
        coursesCreated: courses.length,
        totalStudents: enrollmentStats.reduce((sum, stat) => sum + stat.enrollments, 0),
        totalRevenue: totalRevenue[0]?.total || 0,
        courses: courses.map(course => ({
          _id: course._id,
          title: course.title,
          price: course.pricing,
          enrollments: enrollmentStats.find(s => s._id.toString() === course._id.toString())?.enrollments || 0
        }))
      };
    } else if (user.role === 'student') {
      // Get student's enrolled courses
      const studentCourses = await StudentCourses.findOne({ userId }).populate('courses');
      const orders = await Order.find({ userId }).populate('courseId');

      additionalData = {
        enrolledCourses: studentCourses?.courses?.length || 0,
        totalSpent: orders.reduce((sum, order) => sum + (order.coursePricing || 0), 0),
        courses: studentCourses?.courses || [],
        orders: orders
      };
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: '-password -resetToken' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// Deactivate/Activate user
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: isActive },
      { new: true, select: '-password -resetToken' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// Get platform analytics
export const getPlatformAnalytics = async (req, res) => {
  try {
    const { timeframe = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    // User registrations over time
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Course enrollments over time
    const courseEnrollments = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          enrollments: { $sum: 1 },
          revenue: { $sum: '$coursePricing' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Top courses by enrollment
    const topCourses = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$courseId',
          enrollments: { $sum: 1 },
          revenue: { $sum: '$coursePricing' }
        }
      },
      { $sort: { enrollments: -1 } },
      { $limit: 5 }
    ]);

    // Populate course details
    const populatedTopCourses = await Course.populate(topCourses, {
      path: '_id',
      select: 'title pricing'
    });

    // Top instructors by revenue
    const topInstructors = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course.instructorId',
          revenue: { $sum: '$coursePricing' },
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Populate instructor details
    const populatedTopInstructors = await User.populate(topInstructors, {
      path: '_id',
      select: 'userName userEmail'
    });

    res.status(200).json({
      success: true,
      data: {
        userRegistrations,
        courseEnrollments,
        topCourses: populatedTopCourses,
        topInstructors: populatedTopInstructors
      }
    });
  } catch (error) {
    console.error('Error fetching platform analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform analytics',
      error: error.message
    });
  }
};
import Certificate from "../../models/Certificate.js";
import CourseProgress from "../../models/CourseProgress.js";
import Course from "../../models/Course.js";
import User from "../../models/User.js";
import StudentCourses from "../../models/StudentCourses.js";

/**
 * Get all certificates for a student
 */
const getStudentCertificates = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const certificates = await Certificate.find({ 
      userId, 
      status: "active" 
    })
      .sort({ issueDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: certificates,
      message: certificates.length 
        ? "Certificates retrieved successfully" 
        : "No certificates found",
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificates",
    });
  }
};

/**
 * Get a single certificate by ID
 */
const getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ 
      certificateId,
      status: "active"
    }).lean();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found or has been revoked",
      });
    }

    res.status(200).json({
      success: true,
      data: certificate,
      message: "Certificate retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate",
    });
  }
};

/**
 * Verify a certificate (public endpoint for sharing)
 */
const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId }).lean();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Certificate not found",
      });
    }

    const isValid = certificate.status === "active" && 
      (!certificate.expiryDate || new Date(certificate.expiryDate) > new Date());

    res.status(200).json({
      success: true,
      verified: isValid,
      data: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName,
        completionDate: certificate.completionDate,
        issueDate: certificate.issueDate,
        courseDuration: certificate.courseDuration,
        status: certificate.status,
        expiryDate: certificate.expiryDate,
      },
      message: isValid 
        ? "Certificate is valid and verified" 
        : "Certificate is expired or revoked",
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({
      success: false,
      verified: false,
      message: "Failed to verify certificate",
    });
  }
};

/**
 * Generate certificate when course is completed
 */
const generateCertificate = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { courseId } = req.params;

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({ userId, courseId });
    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        data: existingCertificate,
        message: "Certificate already exists",
      });
    }

    // Check if course is purchased
    const studentCourses = await StudentCourses.findOne({ userId });
    const isPurchased = studentCourses?.courses?.some(
      (item) => String(item.courseId) === String(courseId)
    );

    if (!isPurchased) {
      return res.status(403).json({
        success: false,
        message: "You must purchase this course to receive a certificate",
      });
    }

    // Check if course is completed
    const progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress || !progress.completed) {
      return res.status(403).json({
        success: false,
        message: "You must complete all lectures to receive a certificate",
      });
    }

    // Get course and user details
    const course = await Course.findById(courseId).lean();
    const user = await User.findById(userId).lean();
    const instructor = await User.findById(course.instructorId).lean();

    if (!course || !user) {
      return res.status(404).json({
        success: false,
        message: "Course or user not found",
      });
    }

    // Calculate course duration
    let totalDuration = 0;
    if (course.curriculum && course.curriculum.length > 0) {
      // Assuming each lecture has a duration field
      totalDuration = course.curriculum.reduce((acc, lecture) => {
        return acc + (lecture.duration || 0);
      }, 0);
    }
    const durationText = totalDuration > 0 
      ? `${Math.round(totalDuration / 60)} hours` 
      : "";

    // Create certificate
    const certificate = new Certificate({
      userId,
      courseId,
      studentName: user.userName,
      courseName: course.title,
      instructorName: instructor?.userName || "EduCore Instructor",
      completionDate: progress.completionDate || new Date(),
      issueDate: new Date(),
      courseDuration: durationText,
    });

    await certificate.save();

    res.status(201).json({
      success: true,
      data: certificate,
      message: "Certificate generated successfully",
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate certificate",
    });
  }
};

/**
 * Get certificate for a specific course
 */
const getCertificateByCourse = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { courseId } = req.params;

    const certificate = await Certificate.findOne({ 
      userId, 
      courseId,
      status: "active"
    }).lean();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found for this course",
      });
    }

    res.status(200).json({
      success: true,
      data: certificate,
      message: "Certificate retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate",
    });
  }
};

export default {
  getStudentCertificates,
  getCertificateById,
  verifyCertificate,
  generateCertificate,
  getCertificateByCourse,
};

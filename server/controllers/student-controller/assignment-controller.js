import Assignment from "../../models/Assignment.js";
import AssignmentSubmission from "../../models/AssignmentSubmission.js";
import StudentCourses from "../../models/StudentCourses.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Get available assignments for a student in a course
export const getStudentAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.userId;

    // Verify student is enrolled in the course
    const enrollment = await StudentCourses.findOne({ 
      userId: studentId, 
      courses: courseId 
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Get published assignments for the course
    const assignments = await Assignment.find({ 
      courseId, 
      isPublished: true,
      'settings.availableFrom': { $lte: new Date() }
    })
    .populate('lectureId', 'title')
    .sort({ 'settings.dueDate': 1 });

    // Get student's submissions for each assignment
    const assignmentsWithSubmissions = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await AssignmentSubmission.findOne({ 
          assignmentId: assignment._id, 
          studentId 
        });

        const now = new Date();
        const dueDate = new Date(assignment.settings.dueDate);
        const isOverdue = now > dueDate && (!submission || submission.status === 'draft');

        return {
          ...assignment.toObject(),
          submission: submission || null,
          isOverdue,
          daysUntilDue: Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)),
          canSubmit: submission?.status !== 'submitted' && submission?.status !== 'graded'
        };
      })
    );

    res.status(200).json({
      success: true,
      data: assignmentsWithSubmissions
    });
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// Get assignment details for student
export const getAssignmentDetailsForStudent = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.userId;

    const assignment = await Assignment.findOne({ 
      _id: assignmentId, 
      isPublished: true 
    })
    .populate('courseId', 'title')
    .populate('lectureId', 'title');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or not available'
      });
    }

    // Check if student is enrolled
    const enrollment = await StudentCourses.findOne({ 
      userId: studentId, 
      courses: assignment.courseId._id 
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Get student's submission
    const submission = await AssignmentSubmission.findOne({ 
      assignmentId, 
      studentId 
    });

    const now = new Date();
    const dueDate = new Date(assignment.settings.dueDate);
    const isOverdue = now > dueDate;

    res.status(200).json({
      success: true,
      data: {
        assignment,
        submission: submission || null,
        isOverdue,
        daysUntilDue: Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)),
        canSubmit: !submission || (submission.status === 'draft' && 
          (assignment.settings.allowLateSubmission || !isOverdue))
      }
    });
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment details',
      error: error.message
    });
  }
};

// Start or get draft submission
export const getOrCreateSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.userId;

    // Get assignment
    const assignment = await Assignment.findOne({ 
      _id: assignmentId, 
      isPublished: true 
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or not available'
      });
    }

    // Check enrollment
    const enrollment = await StudentCourses.findOne({ 
      userId: studentId, 
      courses: assignment.courseId 
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Get or create submission
    let submission = await AssignmentSubmission.findOne({ 
      assignmentId, 
      studentId 
    });

    if (!submission) {
      submission = new AssignmentSubmission({
        assignmentId,
        studentId,
        courseId: assignment.courseId,
        maxScore: assignment.settings.maxPoints,
        status: 'draft'
      });

      await submission.save();
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error getting/creating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error accessing submission',
      error: error.message
    });
  }
};

// Save draft submission
export const saveDraftSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { textSubmission } = req.body;
    const studentId = req.user.userId;

    const submission = await AssignmentSubmission.findOne({ 
      _id: submissionId, 
      studentId,
      status: 'draft'
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Draft submission not found'
      });
    }

    submission.textSubmission = textSubmission;
    submission.lastModified = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Draft saved successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error saving draft submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving draft',
      error: error.message
    });
  }
};

// Upload file for assignment
export const uploadAssignmentFile = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const studentId = req.user.userId;

    const submission = await AssignmentSubmission.findOne({ 
      _id: submissionId, 
      studentId 
    }).populate('assignmentId');

    if (!submission || submission.status === 'submitted' || submission.status === 'graded') {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or cannot be modified'
      });
    }

    const assignment = submission.assignmentId;

    // Check file limits
    if (submission.files.length >= assignment.settings.maxFiles) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${assignment.settings.maxFiles} files allowed`
      });
    }

    // Check file type
    const allowedTypes = assignment.settings.allowedFileTypes;
    if (allowedTypes.length > 0) {
      const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          message: `File type .${fileExtension} not allowed. Allowed types: ${allowedTypes.join(', ')}`
        });
      }
    }

    // Check file size
    const maxSizeBytes = assignment.settings.maxFileSize * 1024 * 1024; // Convert MB to bytes
    if (req.file.size > maxSizeBytes) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds ${assignment.settings.maxFileSize}MB limit`
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `assignments/${assignment._id}`,
      resource_type: 'auto'
    });

    // Add file to submission
    const fileData = {
      filename: result.public_id,
      originalName: req.file.originalname,
      url: result.secure_url,
      size: req.file.size,
      mimeType: req.file.mimetype
    };

    submission.files.push(fileData);
    submission.lastModified = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: fileData
    });
  } catch (error) {
    console.error('Error uploading assignment file:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
};

// Remove file from submission
export const removeAssignmentFile = async (req, res) => {
  try {
    const { submissionId, fileId } = req.params;
    const studentId = req.user.userId;

    const submission = await AssignmentSubmission.findOne({ 
      _id: submissionId, 
      studentId,
      status: 'draft'
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Draft submission not found'
      });
    }

    // Find and remove file
    const fileIndex = submission.files.findIndex(file => file._id.toString() === fileId);
    
    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const fileToRemove = submission.files[fileIndex];

    // Remove from Cloudinary
    try {
      await cloudinary.uploader.destroy(fileToRemove.filename);
    } catch (cloudinaryError) {
      console.error('Error deleting file from Cloudinary:', cloudinaryError);
      // Continue with removal from database even if Cloudinary deletion fails
    }

    // Remove from submission
    submission.files.splice(fileIndex, 1);
    submission.lastModified = new Date();

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'File removed successfully'
    });
  } catch (error) {
    console.error('Error removing assignment file:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing file',
      error: error.message
    });
  }
};

// Submit assignment
export const submitAssignment = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const studentId = req.user.userId;

    const submission = await AssignmentSubmission.findOne({ 
      _id: submissionId, 
      studentId,
      status: 'draft'
    }).populate('assignmentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Draft submission not found'
      });
    }

    const assignment = submission.assignmentId;
    const now = new Date();
    const dueDate = new Date(assignment.settings.dueDate);
    const isLate = now > dueDate;

    // Check if late submission is allowed
    if (isLate && !assignment.settings.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Late submissions are not allowed for this assignment'
      });
    }

    // Validate submission requirements
    if (assignment.settings.requireTextSubmission && !submission.textSubmission?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Text submission is required'
      });
    }

    if (submission.files.length === 0 && !submission.textSubmission?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either text submission or upload files'
      });
    }

    // Calculate late penalty
    let latePenalty = 0;
    let daysLate = 0;

    if (isLate) {
      daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
      latePenalty = Math.min(daysLate * assignment.settings.latePenalty, 100);
    }

    // Update submission
    submission.status = 'submitted';
    submission.submittedAt = now;
    submission.isLate = isLate;
    submission.daysLate = daysLate;
    submission.latePenaltyApplied = latePenalty;

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        submittedAt: submission.submittedAt,
        isLate: submission.isLate,
        daysLate: submission.daysLate,
        latePenaltyApplied: submission.latePenaltyApplied
      }
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment',
      error: error.message
    });
  }
};

// Get assignment results
export const getAssignmentResults = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const studentId = req.user.userId;

    const submission = await AssignmentSubmission.findOne({ 
      _id: submissionId, 
      studentId,
      status: { $in: ['submitted', 'graded', 'returned'] }
    })
    .populate('assignmentId', 'title settings')
    .populate('gradedBy', 'userName');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching assignment results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment results',
      error: error.message
    });
  }
};

// Get student's assignment history
export const getStudentAssignmentHistory = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.userId;

    const submissions = await AssignmentSubmission.find({ 
      studentId, 
      courseId,
      status: { $in: ['submitted', 'graded', 'returned'] }
    })
    .populate('assignmentId', 'title settings')
    .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching assignment history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment history',
      error: error.message
    });
  }
};
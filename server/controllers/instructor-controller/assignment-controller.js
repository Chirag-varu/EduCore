import Assignment from "../../models/Assignment.js";
import AssignmentSubmission from "../../models/AssignmentSubmission.js";
import Course from "../../models/Course.js";

// Create a new assignment
export const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, instructions, settings, rubric, lectureId } = req.body;
    const instructorId = req.user.userId;

    // Verify course ownership
    const course = await Course.findOne({ _id: courseId, instructorId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or access denied'
      });
    }

    const assignment = new Assignment({
      title,
      description,
      instructions,
      courseId,
      instructorId,
      lectureId,
      settings: {
        ...settings,
        dueDate: new Date(settings.dueDate),
        availableFrom: settings?.availableFrom ? new Date(settings.availableFrom) : new Date()
      },
      rubric: rubric || []
    });

    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assignment',
      error: error.message
    });
  }
};

// Get all assignments for an instructor's course
export const getInstructorAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.user.userId;
    const { page = 1, limit = 10, search = '' } = req.query;

    // Verify course ownership
    const course = await Course.findOne({ _id: courseId, instructorId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or access denied'
      });
    }

    // Build search filter
    const filter = { courseId, instructorId };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const assignments = await Assignment.find(filter)
      .populate('lectureId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAssignments = await Assignment.countDocuments(filter);

    // Get submission statistics for each assignment
    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        const submissions = await AssignmentSubmission.countDocuments({ 
          assignmentId: assignment._id 
        });
        const gradedSubmissions = await AssignmentSubmission.countDocuments({ 
          assignmentId: assignment._id, 
          status: 'graded' 
        });
        const pendingSubmissions = await AssignmentSubmission.countDocuments({ 
          assignmentId: assignment._id, 
          status: 'submitted' 
        });
        const lateSubmissions = await AssignmentSubmission.countDocuments({ 
          assignmentId: assignment._id, 
          isLate: true 
        });

        const averageScore = await AssignmentSubmission.aggregate([
          { $match: { assignmentId: assignment._id, status: 'graded' } },
          { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
        ]);

        return {
          ...assignment.toObject(),
          stats: {
            totalSubmissions: submissions,
            gradedSubmissions,
            pendingSubmissions,
            lateSubmissions,
            averageScore: averageScore[0]?.avgScore || 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        assignments: assignmentsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAssignments / parseInt(limit)),
          totalAssignments,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching instructor assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// Get assignment details
export const getAssignmentDetails = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const instructorId = req.user.userId;

    const assignment = await Assignment.findOne({ _id: assignmentId, instructorId })
      .populate('courseId', 'title')
      .populate('lectureId', 'title');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or access denied'
      });
    }

    // Get submissions
    const submissions = await AssignmentSubmission.find({ assignmentId })
      .populate('studentId', 'userName userEmail')
      .sort({ submittedAt: -1 });

    // Calculate statistics
    const stats = {
      totalSubmissions: submissions.length,
      gradedSubmissions: submissions.filter(s => s.status === 'graded').length,
      pendingSubmissions: submissions.filter(s => s.status === 'submitted').length,
      draftSubmissions: submissions.filter(s => s.status === 'draft').length,
      lateSubmissions: submissions.filter(s => s.isLate).length,
      averageScore: submissions.length > 0 ? 
        submissions.reduce((sum, sub) => sum + (sub.percentage || 0), 0) / submissions.length : 0,
      highestScore: Math.max(...submissions.map(s => s.percentage || 0), 0),
      lowestScore: submissions.length > 0 ? Math.min(...submissions.map(s => s.percentage || 0).filter(s => s > 0)) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        assignment,
        submissions,
        stats
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

// Update assignment
export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const instructorId = req.user.userId;
    const updateData = req.body;

    // Convert date strings to Date objects
    if (updateData.settings?.dueDate) {
      updateData.settings.dueDate = new Date(updateData.settings.dueDate);
    }
    if (updateData.settings?.availableFrom) {
      updateData.settings.availableFrom = new Date(updateData.settings.availableFrom);
    }

    const assignment = await Assignment.findOneAndUpdate(
      { _id: assignmentId, instructorId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment',
      error: error.message
    });
  }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const instructorId = req.user.userId;

    // Check if assignment has submissions
    const submissionCount = await AssignmentSubmission.countDocuments({ assignmentId });
    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete assignment with existing submissions'
      });
    }

    const assignment = await Assignment.findOneAndDelete({ _id: assignmentId, instructorId });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment',
      error: error.message
    });
  }
};

// Grade assignment submission
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback, rubricScores } = req.body;
    const instructorId = req.user.userId;

    // Get submission and verify ownership
    const submission = await AssignmentSubmission.findById(submissionId)
      .populate('assignmentId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Verify instructor owns the assignment
    if (submission.assignmentId.instructorId.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update submission with grade
    submission.score = score;
    submission.maxScore = submission.assignmentId.settings.maxPoints;
    submission.feedback = {
      general: feedback || '',
      rubricScores: rubricScores || []
    };
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = instructorId;

    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Assignment graded successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error grading submission',
      error: error.message
    });
  }
};

// Bulk grade submissions
export const bulkGradeSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { submissions } = req.body; // Array of { submissionId, score, feedback }
    const instructorId = req.user.userId;

    // Verify assignment ownership
    const assignment = await Assignment.findOne({ _id: assignmentId, instructorId });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or access denied'
      });
    }

    const updatedSubmissions = [];

    for (const submissionData of submissions) {
      const submission = await AssignmentSubmission.findById(submissionData.submissionId);
      
      if (submission && submission.assignmentId.toString() === assignmentId) {
        submission.score = submissionData.score;
        submission.maxScore = assignment.settings.maxPoints;
        submission.feedback = {
          general: submissionData.feedback || '',
          rubricScores: submissionData.rubricScores || []
        };
        submission.status = 'graded';
        submission.gradedAt = new Date();
        submission.gradedBy = instructorId;

        await submission.save();
        updatedSubmissions.push(submission);
      }
    }

    res.status(200).json({
      success: true,
      message: `${updatedSubmissions.length} submissions graded successfully`,
      data: updatedSubmissions
    });
  } catch (error) {
    console.error('Error bulk grading submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk grading submissions',
      error: error.message
    });
  }
};

// Publish/unpublish assignment
export const toggleAssignmentPublication = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { isPublished } = req.body;
    const instructorId = req.user.userId;

    const assignment = await Assignment.findOne({ _id: assignmentId, instructorId });
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or access denied'
      });
    }

    assignment.isPublished = isPublished;
    await assignment.save();

    res.status(200).json({
      success: true,
      message: `Assignment ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: assignment
    });
  } catch (error) {
    console.error('Error toggling assignment publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating assignment publication status',
      error: error.message
    });
  }
};
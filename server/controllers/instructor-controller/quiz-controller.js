import Quiz, { Question } from "../../models/Quiz.js";
import Course from "../../models/Course.js";
import QuizAttempt from "../../models/QuizAttempt.js";

// Create a new quiz
export const createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, settings, lectureId } = req.body;
    const instructorId = req.user.userId;

    // Verify course ownership
    const course = await Course.findOne({ _id: courseId, instructorId });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or access denied'
      });
    }

    const quiz = new Quiz({
      title,
      description,
      courseId,
      instructorId,
      lectureId,
      settings: {
        ...settings,
        availableFrom: settings?.availableFrom ? new Date(settings.availableFrom) : new Date(),
        availableUntil: settings?.availableUntil ? new Date(settings.availableUntil) : null
      }
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message
    });
  }
};

// Get all quizzes for an instructor's course
export const getInstructorQuizzes = async (req, res) => {
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

    const quizzes = await Quiz.find(filter)
      .populate('questions')
      .populate('lectureId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalQuizzes = await Quiz.countDocuments(filter);

    // Get attempt statistics for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await QuizAttempt.countDocuments({ quizId: quiz._id });
        const completedAttempts = await QuizAttempt.countDocuments({ 
          quizId: quiz._id, 
          status: 'submitted' 
        });
        const averageScore = await QuizAttempt.aggregate([
          { $match: { quizId: quiz._id, status: 'submitted' } },
          { $group: { _id: null, avgScore: { $avg: '$score' } } }
        ]);

        return {
          ...quiz.toObject(),
          stats: {
            totalAttempts: attempts,
            completedAttempts,
            averageScore: averageScore[0]?.avgScore || 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        quizzes: quizzesWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalQuizzes / parseInt(limit)),
          totalQuizzes,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching instructor quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
      error: error.message
    });
  }
};

// Get quiz details
export const getQuizDetails = async (req, res) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.user.userId;

    const quiz = await Quiz.findOne({ _id: quizId, instructorId })
      .populate('questions')
      .populate('courseId', 'title')
      .populate('lectureId', 'title');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or access denied'
      });
    }

    // Get detailed statistics
    const attempts = await QuizAttempt.find({ quizId })
      .populate('studentId', 'userName userEmail')
      .sort({ createdAt: -1 });

    const stats = {
      totalAttempts: attempts.length,
      completedAttempts: attempts.filter(a => a.status === 'submitted').length,
      inProgressAttempts: attempts.filter(a => a.status === 'in-progress').length,
      averageScore: attempts.length > 0 ? 
        attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length : 0,
      averageTimeSpent: attempts.length > 0 ?
        attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0) / attempts.length : 0
    };

    res.status(200).json({
      success: true,
      data: {
        quiz,
        attempts,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz details',
      error: error.message
    });
  }
};

// Update quiz
export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.user.userId;
    const updateData = req.body;

    const quiz = await Quiz.findOneAndUpdate(
      { _id: quizId, instructorId },
      updateData,
      { new: true, runValidators: true }
    ).populate('questions');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quiz',
      error: error.message
    });
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.user.userId;

    // Check if quiz has attempts
    const attemptCount = await QuizAttempt.countDocuments({ quizId });
    if (attemptCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete quiz with existing attempts'
      });
    }

    const quiz = await Quiz.findOneAndDelete({ _id: quizId, instructorId });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or access denied'
      });
    }

    // Delete associated questions
    await Question.deleteMany({ _id: { $in: quiz.questions } });

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz',
      error: error.message
    });
  }
};

// Add question to quiz
export const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const instructorId = req.user.userId;
    const questionData = req.body;

    // Verify quiz ownership
    const quiz = await Quiz.findOne({ _id: quizId, instructorId });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or access denied'
      });
    }

    // Create question
    const question = new Question({
      ...questionData,
      order: quiz.questions.length
    });

    await question.save();

    // Add question to quiz
    quiz.questions.push(question._id);
    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: question
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding question',
      error: error.message
    });
  }
};

// Update question
export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const instructorId = req.user.userId;
    const updateData = req.body;

    // Verify question belongs to instructor's quiz
    const quiz = await Quiz.findOne({ 
      questions: questionId, 
      instructorId 
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Question not found or access denied'
      });
    }

    const question = await Question.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const instructorId = req.user.userId;

    // Verify question belongs to instructor's quiz
    const quiz = await Quiz.findOne({ 
      questions: questionId, 
      instructorId 
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Question not found or access denied'
      });
    }

    // Remove question from quiz
    quiz.questions = quiz.questions.filter(q => q.toString() !== questionId);
    await quiz.save();

    // Delete question
    await Question.findByIdAndDelete(questionId);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// Publish/unpublish quiz
export const toggleQuizPublication = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { isPublished } = req.body;
    const instructorId = req.user.userId;

    const quiz = await Quiz.findOne({ _id: quizId, instructorId });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or access denied'
      });
    }

    // Validate quiz before publishing
    if (isPublished && quiz.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish quiz without questions'
      });
    }

    quiz.isPublished = isPublished;
    await quiz.save();

    res.status(200).json({
      success: true,
      message: `Quiz ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: quiz
    });
  } catch (error) {
    console.error('Error toggling quiz publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quiz publication status',
      error: error.message
    });
  }
};
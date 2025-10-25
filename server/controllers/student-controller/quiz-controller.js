import Quiz, { Question } from "../../models/Quiz.js";
import QuizAttempt from "../../models/QuizAttempt.js";
import Course from "../../models/Course.js";
import StudentCourses from "../../models/StudentCourses.js";

// Get available quizzes for a student in a course
export const getStudentQuizzes = async (req, res) => {
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

    // Get published quizzes for the course
    const quizzes = await Quiz.find({ 
      courseId, 
      isPublished: true,
      'settings.availableFrom': { $lte: new Date() },
      $or: [
        { 'settings.availableUntil': null },
        { 'settings.availableUntil': { $gte: new Date() } }
      ]
    })
    .populate('lectureId', 'title')
    .select('-questions') // Don't send questions in list view
    .sort({ createdAt: -1 });

    // Get student's attempts for each quiz
    const quizzesWithAttempts = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await QuizAttempt.find({ 
          quizId: quiz._id, 
          studentId 
        }).sort({ attemptNumber: -1 });

        const canAttempt = attempts.length < quiz.settings.attemptLimit;
        const bestScore = attempts.length > 0 ? 
          Math.max(...attempts.map(a => a.score)) : 0;

        return {
          ...quiz.toObject(),
          attempts: attempts.length,
          bestScore,
          canAttempt,
          lastAttempt: attempts[0] || null
        };
      })
    );

    res.status(200).json({
      success: true,
      data: quizzesWithAttempts
    });
  } catch (error) {
    console.error('Error fetching student quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
      error: error.message
    });
  }
};

// Start a quiz attempt
export const startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.userId;

    // Get quiz details
    const quiz = await Quiz.findOne({ 
      _id: quizId, 
      isPublished: true 
    }).populate('questions');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or not available'
      });
    }

    // Check if student is enrolled
    const enrollment = await StudentCourses.findOne({ 
      userId: studentId, 
      courses: quiz.courseId 
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check attempt limit
    const existingAttempts = await QuizAttempt.countDocuments({ 
      quizId, 
      studentId 
    });

    if (existingAttempts >= quiz.settings.attemptLimit) {
      return res.status(400).json({
        success: false,
        message: 'You have exceeded the maximum number of attempts for this quiz'
      });
    }

    // Check if there's an active attempt
    const activeAttempt = await QuizAttempt.findOne({ 
      quizId, 
      studentId, 
      status: 'in-progress' 
    });

    if (activeAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active attempt for this quiz',
        data: { attemptId: activeAttempt._id }
      });
    }

    // Create new attempt
    const attempt = new QuizAttempt({
      quizId,
      studentId,
      courseId: quiz.courseId,
      attemptNumber: existingAttempts + 1,
      answers: quiz.questions.map(question => ({
        questionId: question._id,
        selectedAnswer: null,
        isCorrect: false,
        pointsAwarded: 0,
        timeSpent: 0
      })),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await attempt.save();

    // Prepare quiz data for student (without correct answers)
    const quizForStudent = {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => {
        const questionObj = q.toObject();
        
        // Remove correct answers from multiple choice options
        if (q.type === 'multiple-choice' || q.type === 'true-false') {
          questionObj.options = q.options.map(opt => ({
            text: opt.text,
            _id: opt._id
          }));
        }
        
        // Remove correct answers
        delete questionObj.correctAnswer;
        delete questionObj.options?.isCorrect;
        
        return questionObj;
      })
    };

    res.status(201).json({
      success: true,
      message: 'Quiz attempt started successfully',
      data: {
        attempt: {
          _id: attempt._id,
          attemptNumber: attempt.attemptNumber,
          startedAt: attempt.startedAt
        },
        quiz: quizForStudent
      }
    });
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting quiz attempt',
      error: error.message
    });
  }
};

// Get active quiz attempt
export const getActiveQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.userId;

    const attempt = await QuizAttempt.findOne({ 
      _id: attemptId, 
      studentId, 
      status: 'in-progress' 
    }).populate({
      path: 'quizId',
      populate: {
        path: 'questions'
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active quiz attempt not found'
      });
    }

    // Prepare quiz data without correct answers
    const quiz = attempt.quizId;
    const quizForStudent = {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => {
        const questionObj = q.toObject();
        
        if (q.type === 'multiple-choice' || q.type === 'true-false') {
          questionObj.options = q.options.map(opt => ({
            text: opt.text,
            _id: opt._id
          }));
        }
        
        delete questionObj.correctAnswer;
        return questionObj;
      })
    };

    res.status(200).json({
      success: true,
      data: {
        attempt: {
          _id: attempt._id,
          attemptNumber: attempt.attemptNumber,
          startedAt: attempt.startedAt,
          answers: attempt.answers
        },
        quiz: quizForStudent
      }
    });
  } catch (error) {
    console.error('Error fetching active quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz attempt',
      error: error.message
    });
  }
};

// Save quiz answer
export const saveQuizAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedAnswer, timeSpent } = req.body;
    const studentId = req.user.userId;

    const attempt = await QuizAttempt.findOne({ 
      _id: attemptId, 
      studentId, 
      status: 'in-progress' 
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active quiz attempt not found'
      });
    }

    // Find and update the answer
    const answerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (answerIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Question not found in this attempt'
      });
    }

    attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
    attempt.answers[answerIndex].timeSpent = timeSpent || 0;

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Answer saved successfully'
    });
  } catch (error) {
    console.error('Error saving quiz answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving answer',
      error: error.message
    });
  }
};

// Submit quiz attempt
export const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.userId;

    const attempt = await QuizAttempt.findOne({ 
      _id: attemptId, 
      studentId, 
      status: 'in-progress' 
    }).populate({
      path: 'quizId',
      populate: {
        path: 'questions'
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active quiz attempt not found'
      });
    }

    const quiz = attempt.quizId;
    let totalPointsEarned = 0;

    // Grade the quiz
    for (let i = 0; i < attempt.answers.length; i++) {
      const answer = attempt.answers[i];
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId.toString());
      
      if (!question) continue;

      let isCorrect = false;
      let pointsAwarded = 0;

      switch (question.type) {
        case 'multiple-choice':
          const selectedOption = question.options.find(opt => 
            opt._id.toString() === answer.selectedAnswer
          );
          isCorrect = selectedOption?.isCorrect || false;
          pointsAwarded = isCorrect ? question.points : 0;
          break;

        case 'true-false':
          const selectedTrueFalse = question.options.find(opt => 
            opt._id.toString() === answer.selectedAnswer
          );
          isCorrect = selectedTrueFalse?.isCorrect || false;
          pointsAwarded = isCorrect ? question.points : 0;
          break;

        case 'short-answer':
        case 'fill-blank':
          // Case-insensitive comparison for short answers
          isCorrect = answer.selectedAnswer?.toLowerCase().trim() === 
                     question.correctAnswer?.toLowerCase().trim();
          pointsAwarded = isCorrect ? question.points : 0;
          break;

        case 'essay':
          // Essays need manual grading
          isCorrect = null;
          pointsAwarded = 0;
          break;
      }

      attempt.answers[i].isCorrect = isCorrect;
      attempt.answers[i].pointsAwarded = pointsAwarded;
      totalPointsEarned += pointsAwarded;
    }

    // Calculate final score
    const totalPossiblePoints = quiz.totalPoints;
    const scorePercentage = totalPossiblePoints > 0 ? 
      Math.round((totalPointsEarned / totalPossiblePoints) * 100) : 0;

    // Update attempt
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    attempt.pointsEarned = totalPointsEarned;
    attempt.totalPoints = totalPossiblePoints;
    attempt.score = scorePercentage;
    attempt.timeSpent = attempt.answers.reduce((total, answer) => total + (answer.timeSpent || 0), 0);

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score: scorePercentage,
        pointsEarned: totalPointsEarned,
        totalPoints: totalPossiblePoints,
        passed: scorePercentage >= quiz.settings.passingScore,
        canReview: quiz.settings.allowReview
      }
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message
    });
  }
};

// Get quiz results
export const getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.userId;

    const attempt = await QuizAttempt.findOne({ 
      _id: attemptId, 
      studentId, 
      status: 'submitted' 
    }).populate({
      path: 'quizId',
      populate: {
        path: 'questions'
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz results not found'
      });
    }

    const quiz = attempt.quizId;

    // Prepare results with correct answers if allowed
    const results = {
      attempt: {
        _id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        pointsEarned: attempt.pointsEarned,
        totalPoints: attempt.totalPoints,
        timeSpent: attempt.timeSpent,
        submittedAt: attempt.submittedAt,
        passed: attempt.score >= quiz.settings.passingScore
      },
      quiz: {
        title: quiz.title,
        description: quiz.description,
        passingScore: quiz.settings.passingScore,
        showCorrectAnswers: quiz.settings.showCorrectAnswers
      },
      questions: []
    };

    if (quiz.settings.showCorrectAnswers) {
      results.questions = quiz.questions.map(question => {
        const studentAnswer = attempt.answers.find(a => 
          a.questionId.toString() === question._id.toString()
        );

        return {
          _id: question._id,
          type: question.type,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          points: question.points,
          studentAnswer: studentAnswer?.selectedAnswer,
          isCorrect: studentAnswer?.isCorrect,
          pointsAwarded: studentAnswer?.pointsAwarded
        };
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz results',
      error: error.message
    });
  }
};

// Get student's quiz history
export const getStudentQuizHistory = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.userId;

    const attempts = await QuizAttempt.find({ 
      studentId, 
      courseId,
      status: 'submitted' 
    })
    .populate('quizId', 'title totalPoints settings.passingScore')
    .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz history',
      error: error.message
    });
  }
};
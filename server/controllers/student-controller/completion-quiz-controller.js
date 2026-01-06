/**
 * Course Completion Quiz Controller
 * Handles AI-generated quiz for course completion assessment
 */

import Quiz, { Question } from "../../models/Quiz.js";
import QuizAttempt from "../../models/QuizAttempt.js";
import Certificate from "../../models/Certificate.js";
import Course from "../../models/Course.js";
import CourseProgress from "../../models/CourseProgress.js";
import User from "../../models/User.js";
import { generateQuizQuestions, evaluateAnswer, initAI } from "../../helpers/aiService.js";

// Initialize AI on module load
initAI().catch(console.error);

const PASSING_SCORE = 35; // 35% to pass

/**
 * Generate completion quiz for a course
 * Called when student completes all lectures
 */
const generateCompletionQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Check if student has completed all lectures
    const progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress) {
      return res.status(400).json({
        success: false,
        message: "You haven't started this course yet"
      });
    }

    // Check if all lectures are viewed
    const totalLectures = course.curriculum?.length || 0;
    const viewedLectures = progress.lecturesProgress?.filter(l => l.viewed).length || 0;
    
    if (totalLectures > 0 && viewedLectures < totalLectures) {
      return res.status(400).json({
        success: false,
        message: `Complete all lectures first. Progress: ${viewedLectures}/${totalLectures}`,
        progress: {
          completed: viewedLectures,
          total: totalLectures
        }
      });
    }

    // Check if quiz already exists for this course
    let quiz = await Quiz.findOne({ 
      courseId, 
      title: { $regex: /completion quiz/i }
    }).populate('questions');

    if (!quiz) {
      // Generate new quiz using AI
      console.log('Generating AI quiz for course:', course.title);
      
      const courseData = {
        title: course.title,
        description: course.description,
        category: course.category,
        objectives: course.objectives,
        curriculum: course.curriculum
      };

      const generatedQuestions = await generateQuizQuestions(courseData, 10);
      
      // Save questions to database
      const savedQuestions = await Promise.all(
        generatedQuestions.map(async (q, index) => {
          const question = new Question({
            ...q,
            order: index + 1
          });
          return question.save();
        })
      );

      // Create quiz
      quiz = new Quiz({
        title: `${course.title} - Completion Quiz`,
        description: `Complete this quiz to earn your certificate. You need ${PASSING_SCORE}% to pass.`,
        courseId: course._id,
        instructorId: course.instructorId,
        questions: savedQuestions.map(q => q._id),
        settings: {
          timeLimit: 30, // 30 minutes
          attemptLimit: 3,
          passingScore: PASSING_SCORE,
          showCorrectAnswers: true,
          shuffleQuestions: true,
          shuffleOptions: true,
          allowReview: true
        },
        totalPoints: savedQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
        isPublished: true,
        isRequired: true
      });

      await quiz.save();
      
      // Populate questions for response
      await quiz.populate('questions');
    }

    // Check existing attempts
    const existingAttempts = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      studentId: userId
    });

    // Check if already passed
    const passedAttempt = await QuizAttempt.findOne({
      quizId: quiz._id,
      studentId: userId,
      score: { $gte: PASSING_SCORE },
      status: 'graded'
    });

    if (passedAttempt) {
      // Check if certificate exists
      const certificate = await Certificate.findOne({ userId, courseId });
      
      return res.status(200).json({
        success: true,
        message: "You have already passed this quiz!",
        data: {
          quiz: formatQuizForStudent(quiz),
          passed: true,
          score: passedAttempt.score,
          certificate: certificate ? {
            id: certificate.certificateId,
            url: certificate.shareUrl
          } : null
        }
      });
    }

    if (existingAttempts >= quiz.settings.attemptLimit) {
      return res.status(400).json({
        success: false,
        message: `You have used all ${quiz.settings.attemptLimit} attempts`,
        attemptsUsed: existingAttempts
      });
    }

    res.status(200).json({
      success: true,
      data: {
        quiz: formatQuizForStudent(quiz),
        attemptsRemaining: quiz.settings.attemptLimit - existingAttempts,
        passingScore: PASSING_SCORE
      }
    });

  } catch (error) {
    console.error("Generate completion quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate quiz"
    });
  }
};

/**
 * Start a quiz attempt
 */
const startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Check attempt limit
    const existingAttempts = await QuizAttempt.countDocuments({
      quizId,
      studentId: userId
    });

    if (existingAttempts >= quiz.settings.attemptLimit) {
      return res.status(400).json({
        success: false,
        message: "No attempts remaining"
      });
    }

    // Check for in-progress attempt
    let attempt = await QuizAttempt.findOne({
      quizId,
      studentId: userId,
      status: 'in-progress'
    });

    if (!attempt) {
      // Create new attempt
      attempt = new QuizAttempt({
        quizId,
        studentId: userId,
        courseId: quiz.courseId,
        attemptNumber: existingAttempts + 1,
        answers: [],
        status: 'in-progress',
        startedAt: new Date(),
        totalPoints: quiz.totalPoints
      });
      await attempt.save();
    }

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        timeLimit: quiz.settings.timeLimit
      }
    });

  } catch (error) {
    console.error("Start quiz attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start quiz"
    });
  }
};

/**
 * Submit quiz answers and get results
 */
const submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // Array of { questionId, answer }
    const userId = req.user._id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      studentId: userId,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found or already submitted"
      });
    }

    const quiz = await Quiz.findById(attempt.quizId).populate('questions');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Evaluate each answer
    let totalPointsEarned = 0;
    const evaluatedAnswers = [];

    for (const submittedAnswer of answers) {
      const question = quiz.questions.find(
        q => q._id.toString() === submittedAnswer.questionId
      );

      if (!question) continue;

      let isCorrect = false;
      let pointsAwarded = 0;
      let feedback = '';

      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        // For multiple choice, check if selected option is correct
        const selectedOption = question.options.find(
          opt => opt.text === submittedAnswer.answer || opt._id?.toString() === submittedAnswer.answer
        );
        isCorrect = selectedOption?.isCorrect || false;
        pointsAwarded = isCorrect ? question.points : 0;
        feedback = isCorrect ? 'Correct!' : `Incorrect. ${question.explanation || ''}`;
      } else if (question.type === 'short-answer' || question.type === 'fill-blank') {
        // Use AI evaluation for short answers
        const evaluation = await evaluateAnswer(
          question.question,
          question.correctAnswer,
          submittedAnswer.answer
        );
        isCorrect = evaluation.isCorrect;
        pointsAwarded = evaluation.score * question.points;
        feedback = evaluation.feedback;
      }

      totalPointsEarned += pointsAwarded;

      evaluatedAnswers.push({
        questionId: question._id,
        selectedAnswer: submittedAnswer.answer,
        isCorrect,
        pointsAwarded,
        feedback
      });
    }

    // Calculate score percentage
    const scorePercentage = quiz.totalPoints > 0 
      ? Math.round((totalPointsEarned / quiz.totalPoints) * 100) 
      : 0;

    const passed = scorePercentage >= PASSING_SCORE;

    // Update attempt
    attempt.answers = evaluatedAnswers;
    attempt.status = 'graded';
    attempt.submittedAt = new Date();
    attempt.gradedAt = new Date();
    attempt.score = scorePercentage;
    attempt.pointsEarned = totalPointsEarned;
    attempt.feedback = passed 
      ? `Congratulations! You passed with ${scorePercentage}%!`
      : `You scored ${scorePercentage}%. You need ${PASSING_SCORE}% to pass. Try again!`;

    await attempt.save();

    let certificate = null;

    // Generate certificate if passed
    if (passed) {
      certificate = await generateCertificate(userId, quiz.courseId);
      
      // Update course progress
      await CourseProgress.findOneAndUpdate(
        { userId, courseId: quiz.courseId },
        { 
          completed: true, 
          completionDate: new Date() 
        }
      );
    }

    // Get remaining attempts
    const totalAttempts = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      studentId: userId
    });

    res.status(200).json({
      success: true,
      data: {
        passed,
        score: scorePercentage,
        pointsEarned: totalPointsEarned,
        totalPoints: quiz.totalPoints,
        passingScore: PASSING_SCORE,
        answers: quiz.settings.showCorrectAnswers ? evaluatedAnswers : undefined,
        feedback: attempt.feedback,
        attemptsRemaining: Math.max(0, quiz.settings.attemptLimit - totalAttempts),
        certificate: certificate ? {
          id: certificate.certificateId,
          url: `/certificate/verify/${certificate.certificateId}`
        } : null
      }
    });

  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz"
    });
  }
};

/**
 * Get quiz attempt history
 */
const getQuizAttempts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findOne({ 
      courseId, 
      title: { $regex: /completion quiz/i }
    });

    if (!quiz) {
      return res.status(200).json({
        success: true,
        data: { attempts: [], quizExists: false }
      });
    }

    const attempts = await QuizAttempt.find({
      quizId: quiz._id,
      studentId: userId
    }).sort({ attemptNumber: -1 });

    res.status(200).json({
      success: true,
      data: {
        quizExists: true,
        attempts: attempts.map(a => ({
          attemptNumber: a.attemptNumber,
          score: a.score,
          status: a.status,
          submittedAt: a.submittedAt,
          passed: a.score >= PASSING_SCORE
        })),
        attemptsRemaining: Math.max(0, quiz.settings.attemptLimit - attempts.length)
      }
    });

  } catch (error) {
    console.error("Get quiz attempts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attempts"
    });
  }
};

/**
 * Generate certificate for a student
 */
const generateCertificate = async (userId, courseId) => {
  try {
    // Check if certificate already exists
    let certificate = await Certificate.findOne({ userId, courseId });
    if (certificate) {
      return certificate;
    }

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      throw new Error('User or course not found');
    }

    // Calculate course duration
    const totalMinutes = course.curriculum?.reduce((sum, lecture) => {
      return sum + (lecture.duration || 0);
    }, 0) || 0;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;

    certificate = new Certificate({
      userId,
      courseId,
      studentName: user.userName,
      courseName: course.title,
      instructorName: course.instructorName,
      completionDate: new Date(),
      issueDate: new Date(),
      courseDuration: duration,
      status: 'active'
    });

    await certificate.save();
    console.log('Certificate generated:', certificate.certificateId);

    return certificate;
  } catch (error) {
    console.error('Certificate generation error:', error);
    return null;
  }
};

/**
 * Get certificate by ID
 */
const getCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found"
      });
    }

    // Get course and quiz details for additional info
    const course = await Course.findById(certificate.courseId);
    const quizAttempt = await QuizAttempt.findOne({
      studentId: certificate.userId,
      courseId: certificate.courseId,
      score: { $gte: PASSING_SCORE }
    }).sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        certificateId: certificate.certificateId,
        userName: certificate.studentName,
        courseName: certificate.courseName,
        instructorName: certificate.instructorName || 'EduCore Instructor',
        courseDuration: certificate.courseDuration,
        score: quizAttempt?.score || PASSING_SCORE,
        issuedAt: certificate.issueDate,
        completedAt: certificate.completionDate,
        status: certificate.status
      }
    });

  } catch (error) {
    console.error("Get certificate error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificate"
    });
  }
};

/**
 * Get all certificates for a user
 */
const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user._id;

    const certificates = await Certificate.find({ userId, status: 'active' })
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      data: certificates
    });

  } catch (error) {
    console.error("Get user certificates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch certificates"
    });
  }
};

/**
 * Format quiz for student (hide correct answers)
 */
const formatQuizForStudent = (quiz) => {
  return {
    _id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    timeLimit: quiz.settings.timeLimit,
    totalQuestions: quiz.questions.length,
    totalPoints: quiz.totalPoints,
    passingScore: quiz.settings.passingScore,
    questions: quiz.questions.map(q => ({
      _id: q._id,
      type: q.type,
      question: q.question,
      description: q.description,
      points: q.points,
      options: q.options?.map(opt => ({
        _id: opt._id,
        text: opt.text
        // Note: isCorrect is NOT included
      }))
    }))
  };
};

export default {
  generateCompletionQuiz,
  startQuizAttempt,
  submitQuiz,
  getQuizAttempts,
  getCertificate,
  getUserCertificates
};

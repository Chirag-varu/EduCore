import { Schema, model } from "mongoose";

const QuestionSchema = new Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay', 'fill-blank'],
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }], // For multiple choice and true/false
  correctAnswer: String, // For short answer and fill-blank
  points: {
    type: Number,
    default: 1,
    min: 0
  },
  explanation: String, // Optional explanation for the correct answer
  media: {
    type: String, // URL to image/video
    default: null
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const Question = model("Question", QuestionSchema);

const QuizSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lectureId: {
    type: Schema.Types.ObjectId,
    ref: "Lecture",
    default: null // Optional - can be linked to a specific lecture
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: "Question"
  }],
  settings: {
    timeLimit: {
      type: Number, // in minutes
      default: null
    },
    attemptLimit: {
      type: Number,
      default: 1
    },
    passingScore: {
      type: Number,
      default: 70 // percentage
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    shuffleOptions: {
      type: Boolean,
      default: false
    },
    allowReview: {
      type: Boolean,
      default: true
    },
    availableFrom: {
      type: Date,
      default: Date.now
    },
    availableUntil: {
      type: Date,
      default: null
    }
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isRequired: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Calculate total points when questions are added/removed
QuizSchema.pre('save', async function(next) {
  if (this.isModified('questions')) {
    const questions = await Question.find({ _id: { $in: this.questions } });
    this.totalPoints = questions.reduce((total, question) => total + question.points, 0);
  }
  next();
});

export default model("Quiz", QuizSchema);
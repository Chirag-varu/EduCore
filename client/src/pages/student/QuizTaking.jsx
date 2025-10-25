import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/api/axiosInstance';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Clock, 
  Save, 
  Send, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Timer,
  FileText,
  HelpCircle
} from 'lucide-react';

const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const intervalRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  useEffect(() => {
    fetchQuizData();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [quizId]);

  useEffect(() => {
    if (quiz?.settings?.timeLimit && attempt && !attempt.completedAt) {
      const startTime = new Date(attempt.startedAt).getTime();
      const timeLimit = quiz.settings.timeLimit * 60 * 1000; // Convert to milliseconds
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = timeLimit - elapsed;
        
        if (remaining <= 0) {
          handleAutoSubmit();
        } else {
          setTimeRemaining(Math.floor(remaining / 1000));
        }
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [quiz, attempt]);

  // Auto-save answers every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (attempt && Object.keys(answers).length > 0) {
        handleAutoSave();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [answers, attempt]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/v1/student/assessment/quiz/${quizId}`);
      
      if (response.data.success) {
        const { quiz: quizData, attempt: attemptData } = response.data.data;
        setQuiz(quizData);
        setAttempt(attemptData);
        
        // Load existing answers if resuming
        if (attemptData?.answers) {
          const answerMap = {};
          attemptData.answers.forEach(answer => {
            answerMap[answer.questionId] = answer.answer;
          });
          setAnswers(answerMap);
        }
        
        // Set initial time remaining
        if (quizData.settings.timeLimit && attemptData && !attemptData.completedAt) {
          const startTime = new Date(attemptData.startedAt).getTime();
          const timeLimit = quizData.settings.timeLimit * 60 * 1000;
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, timeLimit - elapsed);
          setTimeRemaining(Math.floor(remaining / 1000));
        }
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz data.',
        variant: 'destructive',
      });
      navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    try {
      setAutoSaveStatus('saving');
      await axiosInstance.put(`/api/v1/student/assessment/quiz-attempt/${attempt._id}/save`, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        }))
      });
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    setAutoSaveStatus('unsaved');
  };

  const handleAutoSubmit = async () => {
    try {
      await axiosInstance.post(`/api/v1/student/assessment/quiz-attempt/${attempt._id}/submit`, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        }))
      });
      
      toast({
        title: 'Time\'s Up!',
        description: 'Your quiz has been automatically submitted.',
      });
      
      navigate(`/student/quiz/${quizId}/result`);
    } catch (error) {
      console.error('Auto-submit failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to auto-submit quiz.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await axiosInstance.post(`/api/v1/student/assessment/quiz-attempt/${attempt._id}/submit`, {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        }))
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Quiz submitted successfully!',
        });
        navigate(`/student/quiz/${quizId}/result`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit quiz.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!quiz?.questions?.length) return 0;
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / quiz.questions.length) * 100;
  };

  const renderQuestion = (question) => {
    const questionId = question._id;
    const currentAnswer = answers[questionId] || '';

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={questionId}
                  value={option.text}
                  checked={currentAnswer === option.text}
                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                  className="mt-1"
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option) => (
              <label key={option} className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name={questionId}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'short-answer':
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="Enter your answer..."
            className="w-full"
          />
        );

      case 'essay':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="Write your essay response..."
            rows={6}
            className="w-full"
          />
        );

      case 'fill-blank':
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="Fill in the blank..."
            className="w-full"
          />
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Quiz Not Available</h2>
          <p className="text-muted-foreground">This quiz is not accessible or has been removed.</p>
        </div>
      </div>
    );
  }

  if (attempt.completedAt) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Quiz Already Completed</h2>
          <p className="text-muted-foreground mb-4">You have already submitted this quiz.</p>
          <Button onClick={() => navigate(`/student/quiz/${quizId}/result`)}>
            View Results
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">{quiz.description}</p>
          </div>
          
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-lg">
              <Timer className={`h-5 w-5 ${timeRemaining < 300 ? 'text-red-500' : 'text-blue-500'}`} />
              <span className={timeRemaining < 300 ? 'text-red-500 font-bold' : 'text-blue-500'}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <div className="flex items-center gap-2">
              <span>Progress: {Math.round(getProgressPercentage())}%</span>
              <div className="flex items-center gap-1 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  autoSaveStatus === 'saved' ? 'bg-green-500' :
                  autoSaveStatus === 'saving' ? 'bg-yellow-500' :
                  autoSaveStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <span className="capitalize">{autoSaveStatus}</span>
              </div>
            </div>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{currentQuestionData.type}</Badge>
                <Badge variant="outline">{currentQuestionData.points} {currentQuestionData.points === 1 ? 'point' : 'points'}</Badge>
              </div>
              <CardTitle className="text-lg">{currentQuestionData.question}</CardTitle>
              {currentQuestionData.description && (
                <p className="text-muted-foreground mt-2">{currentQuestionData.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderQuestion(currentQuestionData)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleAutoSave}
            disabled={autoSaveStatus === 'saving'}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button 
              onClick={() => setShowSubmitDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Question Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {quiz.questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestion === index ? "default" : "outline"}
                size="sm"
                className={`h-8 w-8 p-0 ${
                  answers[quiz.questions[index]._id] ? 
                    'border-green-500 bg-green-50' : 
                    'border-gray-300'
                }`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-50" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border-2 border-gray-300" />
              <span>Not answered</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>Current</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quiz?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your quiz? Once submitted, you cannot make any changes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Questions answered:</span>
              <span className="font-medium">{Object.keys(answers).length} of {quiz.questions.length}</span>
            </div>
            
            {Object.keys(answers).length < quiz.questions.length && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    You have unanswered questions. They will be marked as incorrect.
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Quiz
            </Button>
            <Button 
              onClick={handleSubmitQuiz} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizTaking;
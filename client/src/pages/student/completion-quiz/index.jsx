import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getCompletionQuizService, 
  startQuizAttemptService, 
  submitQuizService 
} from "@/services";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Award,
  ArrowRight,
  ArrowLeft,
  Trophy,
  RefreshCw
} from "lucide-react";

export default function CompletionQuizPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [alreadyPassed, setAlreadyPassed] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(0);
  const [error, setError] = useState(null);

  // Fetch quiz
  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || !timeRemaining || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCompletionQuizService(courseId);
      
      if (response.success) {
        setQuiz(response.data.quiz);
        setAttemptsRemaining(response.data.attemptsRemaining || 0);
        
        if (response.data.passed) {
          setAlreadyPassed(true);
          setResults({
            passed: true,
            score: response.data.score,
            certificate: response.data.certificate
          });
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError(err.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const response = await startQuizAttemptService(quiz._id);
      
      if (response.success) {
        setAttemptId(response.data.attemptId);
        setQuizStarted(true);
        setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
        setAnswers({});
        setCurrentQuestionIndex(0);
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to start quiz",
        variant: "destructive"
      });
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const response = await submitQuizService(attemptId, formattedAnswers);
      
      if (response.success) {
        setResults(response.data);
        setQuizStarted(false);
        setAttemptsRemaining(response.data.attemptsRemaining);
        
        toast({
          title: response.data.passed ? "Congratulations! 🎉" : "Quiz Complete",
          description: response.data.passed 
            ? `You passed with ${response.data.score}%!`
            : `You scored ${response.data.score}%. You need 35% to pass.`,
          variant: response.data.passed ? "default" : "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const progress = quiz?.questions ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Cannot Load Quiz</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show results screen
  if (results) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="text-center">
          <CardHeader>
            {results.passed ? (
              <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
            ) : (
              <XCircle className="w-20 h-20 mx-auto mb-4 text-red-500" />
            )}
            <CardTitle className={results.passed ? "text-green-600" : "text-red-600"}>
              {results.passed ? "Congratulations! 🎉" : "Keep Trying!"}
            </CardTitle>
            <CardDescription>
              {results.passed 
                ? "You have successfully completed the course assessment"
                : "You didn't pass this time, but you can try again"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{results.score}%</div>
                <div className="text-sm text-gray-500">Your Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">35%</div>
                <div className="text-sm text-gray-500">Passing Score</div>
              </div>
              {!results.passed && (
                <div className="text-center">
                  <div className="text-4xl font-bold">{attemptsRemaining}</div>
                  <div className="text-sm text-gray-500">Attempts Left</div>
                </div>
              )}
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-gray-600 dark:text-gray-300">{results.feedback}</p>
            </div>

            {results.passed && results.certificate && (
              <div className="border-2 border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <Award className="w-12 h-12 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold text-green-700 dark:text-green-400">
                  Certificate Earned!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Your certificate has been generated
                </p>
                <Button 
                  onClick={() => navigate(`/certificate/${results.certificate.id}`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  View Certificate
                </Button>
              </div>
            )}

            {/* Show detailed results if available */}
            {results.answers && (
              <div className="text-left border rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 className="font-semibold mb-3">Question Results:</h4>
                {results.answers.map((ans, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-2 border-b last:border-0">
                    {ans.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm">Question {idx + 1}</span>
                    <Badge variant={ans.isCorrect ? "default" : "destructive"} className="ml-auto">
                      {ans.pointsAwarded} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            {!results.passed && attemptsRemaining > 0 && (
              <Button onClick={() => { setResults(null); handleStartQuiz(); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/student-courses")}>
              Back to Courses
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show quiz start screen
  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              {quiz?.title || "Course Completion Quiz"}
            </CardTitle>
            <CardDescription>{quiz?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{quiz?.totalQuestions || 0}</div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{quiz?.timeLimit || 30}</div>
                <div className="text-sm text-gray-500">Minutes</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{quiz?.passingScore || 35}%</div>
                <div className="text-sm text-gray-500">To Pass</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{attemptsRemaining}</div>
                <div className="text-sm text-gray-500">Attempts Left</div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Important Instructions
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Answer all questions before submitting</li>
                <li>You cannot pause the quiz once started</li>
                <li>Quiz will auto-submit when time runs out</li>
                <li>You need {quiz?.passingScore || 35}% to earn your certificate</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStartQuiz}
              disabled={attemptsRemaining <= 0}
            >
              Start Quiz
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show quiz questions
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with timer and progress */}
      <div className="sticky top-0 bg-background z-10 pb-4 mb-4 border-b">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {quiz?.questions?.length}
          </span>
          <div className={`flex items-center gap-2 font-mono text-lg ${
            timeRemaining < 60 ? 'text-red-500' : ''
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="text-xs text-gray-500 mt-1">
          {answeredCount} of {quiz?.questions?.length} answered
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <Badge variant="outline">{currentQuestion?.type}</Badge>
            <Badge>{currentQuestion?.points} pts</Badge>
          </div>
          <CardTitle className="text-lg mt-2">{currentQuestion?.question}</CardTitle>
          {currentQuestion?.description && (
            <CardDescription>{currentQuestion.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {(currentQuestion?.type === 'multiple-choice' || currentQuestion?.type === 'true-false') && (
            <RadioGroup
              value={answers[currentQuestion._id] || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion._id, value)}
              className="space-y-3"
            >
              {currentQuestion.options?.map((option, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <RadioGroupItem value={option.text} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {(currentQuestion?.type === 'short-answer' || currentQuestion?.type === 'fill-blank') && (
            <Input
              placeholder="Type your answer..."
              value={answers[currentQuestion._id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
              className="mt-2"
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Question Navigation */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {quiz?.questions?.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentQuestionIndex(idx)}
            className={`w-10 h-10 rounded-lg border-2 font-medium transition-colors ${
              idx === currentQuestionIndex
                ? 'border-primary bg-primary text-white'
                : answers[q._id]
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/api/axiosInstance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  Clock, 
  Users,
  Target,
  ArrowLeft,
  Settings
} from 'lucide-react';

const QuizCreator = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    settings: {
      timeLimit: null,
      attemptLimit: 1,
      passingScore: 70,
      showCorrectAnswers: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      allowReview: true,
      availableFrom: new Date().toISOString().slice(0, 16),
      availableUntil: null
    },
    questions: [],
    isPublished: false
  });
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    type: 'multiple-choice',
    question: '',
    description: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: '',
    points: 1,
    explanation: ''
  });

  useEffect(() => {
    if (quizId) {
      fetchQuizDetails();
    }
  }, [quizId]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/v1/instructor/assessment/quiz/${quizId}`);
      
      if (response.data.success) {
        const quizData = response.data.data.quiz;
        setQuiz({
          ...quizData,
          settings: {
            ...quizData.settings,
            availableFrom: quizData.settings.availableFrom ? 
              new Date(quizData.settings.availableFrom).toISOString().slice(0, 16) : 
              new Date().toISOString().slice(0, 16),
            availableUntil: quizData.settings.availableUntil ? 
              new Date(quizData.settings.availableUntil).toISOString().slice(0, 16) : null
          }
        });
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    try {
      setLoading(true);
      
      const quizData = {
        ...quiz,
        courseId,
        settings: {
          ...quiz.settings,
          timeLimit: quiz.settings.timeLimit ? parseInt(quiz.settings.timeLimit) : null,
          attemptLimit: parseInt(quiz.settings.attemptLimit),
          passingScore: parseInt(quiz.settings.passingScore),
          availableUntil: quiz.settings.availableUntil || null
        }
      };

      const response = quizId ? 
        await axiosInstance.put(`/api/v1/instructor/assessment/quiz/${quizId}`, quizData) :
        await axiosInstance.post('/api/v1/instructor/assessment/quiz', quizData);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Quiz ${quizId ? 'updated' : 'created'} successfully.`,
        });
        
        if (!quizId) {
          navigate(`/instructor/quiz/${response.data.data._id}/edit`);
        }
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quiz.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      const questionData = { ...newQuestion };
      
      // Validate question
      if (!questionData.question.trim()) {
        toast({
          title: 'Error',
          description: 'Question text is required.',
          variant: 'destructive',
        });
        return;
      }

      if (questionData.type === 'multiple-choice' || questionData.type === 'true-false') {
        const hasCorrectAnswer = questionData.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          toast({
            title: 'Error',
            description: 'Please mark at least one correct answer.',
            variant: 'destructive',
          });
          return;
        }
      }

      const response = editingQuestion ?
        await axiosInstance.put(`/api/v1/instructor/assessment/question/${editingQuestion._id}`, questionData) :
        await axiosInstance.post(`/api/v1/instructor/assessment/quiz/${quizId}/question`, questionData);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Question ${editingQuestion ? 'updated' : 'added'} successfully.`,
        });
        
        setShowQuestionDialog(false);
        setEditingQuestion(null);
        resetNewQuestion();
        fetchQuizDetails(); // Refresh quiz data
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: 'Error',
        description: 'Failed to save question.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/instructor/assessment/question/${questionId}`);
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Question deleted successfully.',
        });
        fetchQuizDetails();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question.',
        variant: 'destructive',
      });
    }
  };

  const handlePublishQuiz = async () => {
    try {
      if (quiz.questions.length === 0) {
        toast({
          title: 'Error',
          description: 'Cannot publish quiz without questions.',
          variant: 'destructive',
        });
        return;
      }

      const response = await axiosInstance.put(`/api/v1/instructor/assessment/quiz/${quizId}/publish`, {
        isPublished: !quiz.isPublished
      });

      if (response.data.success) {
        setQuiz(prev => ({ ...prev, isPublished: !prev.isPublished }));
        toast({
          title: 'Success',
          description: `Quiz ${quiz.isPublished ? 'unpublished' : 'published'} successfully.`,
        });
      }
    } catch (error) {
      console.error('Error publishing quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quiz status.',
        variant: 'destructive',
      });
    }
  };

  const resetNewQuestion = () => {
    setNewQuestion({
      type: 'multiple-choice',
      question: '',
      description: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: '',
      points: 1,
      explanation: ''
    });
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setNewQuestion({
      type: question.type,
      question: question.question,
      description: question.description || '',
      options: question.options || [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: question.correctAnswer || '',
      points: question.points,
      explanation: question.explanation || ''
    });
    setShowQuestionDialog(true);
  };

  const addOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }));
  };

  const removeOption = (index) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index, field, value) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  if (loading && !quiz.title) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/instructor')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {quizId ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
            <p className="text-muted-foreground">
              {quizId ? 'Modify your quiz settings and questions' : 'Create an engaging quiz for your students'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {quiz.isPublished && (
            <Badge className="bg-green-100 text-green-800">Published</Badge>
          )}
          <Button onClick={handleSaveQuiz} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Quiz'}
          </Button>
          {quizId && (
            <Button 
              variant={quiz.isPublished ? "outline" : "default"} 
              onClick={handlePublishQuiz}
            >
              {quiz.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      {/* Quiz Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quiz Title</label>
              <Input
                value={quiz.title}
                onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
              <Input
                type="number"
                value={quiz.settings.timeLimit || ''}
                onChange={(e) => setQuiz(prev => ({
                  ...prev,
                  settings: { ...prev.settings, timeLimit: e.target.value || null }
                }))}
                placeholder="No time limit"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={quiz.description}
              onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this quiz covers..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quiz Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Attempt Limit</label>
              <Input
                type="number"
                min="1"
                value={quiz.settings.attemptLimit}
                onChange={(e) => setQuiz(prev => ({
                  ...prev,
                  settings: { ...prev.settings, attemptLimit: parseInt(e.target.value) || 1 }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Passing Score (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={quiz.settings.passingScore}
                onChange={(e) => setQuiz(prev => ({
                  ...prev,
                  settings: { ...prev.settings, passingScore: parseInt(e.target.value) || 70 }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Available From</label>
              <Input
                type="datetime-local"
                value={quiz.settings.availableFrom}
                onChange={(e) => setQuiz(prev => ({
                  ...prev,
                  settings: { ...prev.settings, availableFrom: e.target.value }
                }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Available Until (Optional)</label>
              <Input
                type="datetime-local"
                value={quiz.settings.availableUntil || ''}
                onChange={(e) => setQuiz(prev => ({
                  ...prev,
                  settings: { ...prev.settings, availableUntil: e.target.value || null }
                }))}
              />
            </div>
          </div>
          
          {/* Boolean Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={quiz.settings.showCorrectAnswers}
                  onChange={(e) => setQuiz(prev => ({
                    ...prev,
                    settings: { ...prev.settings, showCorrectAnswers: e.target.checked }
                  }))}
                />
                <span className="text-sm">Show correct answers after submission</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={quiz.settings.allowReview}
                  onChange={(e) => setQuiz(prev => ({
                    ...prev,
                    settings: { ...prev.settings, allowReview: e.target.checked }
                  }))}
                />
                <span className="text-sm">Allow students to review answers</span>
              </label>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={quiz.settings.shuffleQuestions}
                  onChange={(e) => setQuiz(prev => ({
                    ...prev,
                    settings: { ...prev.settings, shuffleQuestions: e.target.checked }
                  }))}
                />
                <span className="text-sm">Shuffle question order</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={quiz.settings.shuffleOptions}
                  onChange={(e) => setQuiz(prev => ({
                    ...prev,
                    settings: { ...prev.settings, shuffleOptions: e.target.checked }
                  }))}
                />
                <span className="text-sm">Shuffle answer options</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Questions ({quiz.questions?.length || 0})
            <Badge variant="outline">{quiz.totalPoints || 0} points total</Badge>
          </CardTitle>
          {quizId && (
            <Button onClick={() => setShowQuestionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!quizId ? (
            <div className="text-center py-8 text-muted-foreground">
              Save the quiz first to add questions
            </div>
          ) : quiz.questions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No questions added yet. Click "Add Question" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {quiz.questions?.map((question, index) => (
                <div key={question._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Q{index + 1}.</span>
                        <Badge variant="outline">{question.type}</Badge>
                        <Badge variant="outline">{question.points} pts</Badge>
                      </div>
                      <p className="font-medium">{question.question}</p>
                      {question.description && (
                        <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Show options for multiple choice questions */}
                  {(question.type === 'multiple-choice' || question.type === 'true-false') && (
                    <div className="ml-6 space-y-1">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            option.isCorrect ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className={option.isCorrect ? 'font-medium text-green-700' : 'text-gray-600'}>
                            {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show correct answer for other types */}
                  {(question.type === 'short-answer' || question.type === 'fill-blank') && (
                    <div className="ml-6">
                      <span className="text-sm text-muted-foreground">Correct answer: </span>
                      <span className="font-medium text-green-700">{question.correctAnswer}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              Create engaging questions to test student knowledge
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question Type</label>
                <Select
                  value={newQuestion.type}
                  onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="true-false">True/False</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Points</label>
                <Input
                  type="number"
                  min="1"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion(prev => ({
                    ...prev,
                    points: parseInt(e.target.value) || 1
                  }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Question</label>
              <Textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Textarea
                value={newQuestion.description}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional context or instructions..."
                rows={2}
              />
            </div>

            {/* Multiple Choice Options */}
            {(newQuestion.type === 'multiple-choice' || newQuestion.type === 'true-false') && (
              <div>
                <label className="block text-sm font-medium mb-2">Answer Options</label>
                <div className="space-y-2">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={() => {
                          setNewQuestion(prev => ({
                            ...prev,
                            options: prev.options.map((opt, i) => ({
                              ...opt,
                              isCorrect: i === index
                            }))
                          }));
                        }}
                      />
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      {newQuestion.options.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {newQuestion.type === 'multiple-choice' && newQuestion.options.length < 6 && (
                    <Button variant="outline" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Short Answer / Fill in Blank */}
            {(newQuestion.type === 'short-answer' || newQuestion.type === 'fill-blank') && (
              <div>
                <label className="block text-sm font-medium mb-2">Correct Answer</label>
                <Input
                  value={newQuestion.correctAnswer}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  placeholder="Enter the correct answer..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Explanation (Optional)</label>
              <Textarea
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Explain why this is the correct answer..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowQuestionDialog(false);
                setEditingQuestion(null);
                resetNewQuestion();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddQuestion}>
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizCreator;
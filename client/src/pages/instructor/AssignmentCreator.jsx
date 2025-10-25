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
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  ArrowLeft,
  Settings,
  FileText,
  GraduationCap,
  Calendar,
  Users
} from 'lucide-react';

const AssignmentCreator = () => {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    settings: {
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 7 days from now
      lateSubmissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // 14 days from now
      lateSubmissionPenalty: 10,
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'doc', 'docx', 'txt'],
      maxFiles: 5,
      plagiarismCheck: false,
      peerReview: false,
      anonymousSubmission: false
    },
    rubric: [
      {
        criterion: 'Content Quality',
        description: 'Quality and accuracy of content',
        levels: [
          { name: 'Excellent', points: 25, description: 'Outstanding work demonstrating mastery' },
          { name: 'Good', points: 20, description: 'Good work meeting most requirements' },
          { name: 'Satisfactory', points: 15, description: 'Adequate work meeting basic requirements' },
          { name: 'Needs Improvement', points: 10, description: 'Work below expectations' }
        ]
      }
    ],
    isPublished: false
  });
  const [showRubricDialog, setShowRubricDialog] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState(null);
  const [newCriterion, setNewCriterion] = useState({
    criterion: '',
    description: '',
    levels: [
      { name: 'Excellent', points: 25, description: '' },
      { name: 'Good', points: 20, description: '' },
      { name: 'Satisfactory', points: 15, description: '' },
      { name: 'Needs Improvement', points: 10, description: '' }
    ]
  });

  const fileTypeOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'doc', label: 'Word (.doc)' },
    { value: 'docx', label: 'Word (.docx)' },
    { value: 'txt', label: 'Text (.txt)' },
    { value: 'rtf', label: 'Rich Text (.rtf)' },
    { value: 'odt', label: 'OpenDocument (.odt)' },
    { value: 'jpg', label: 'JPEG Image' },
    { value: 'png', label: 'PNG Image' },
    { value: 'gif', label: 'GIF Image' },
    { value: 'zip', label: 'ZIP Archive' },
    { value: 'rar', label: 'RAR Archive' }
  ];

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDetails();
    }
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/v1/instructor/assessment/assignment/${assignmentId}`);
      
      if (response.data.success) {
        const assignmentData = response.data.data.assignment;
        setAssignment({
          ...assignmentData,
          settings: {
            ...assignmentData.settings,
            dueDate: assignmentData.settings.dueDate ? 
              new Date(assignmentData.settings.dueDate).toISOString().slice(0, 16) : '',
            lateSubmissionDeadline: assignmentData.settings.lateSubmissionDeadline ? 
              new Date(assignmentData.settings.lateSubmissionDeadline).toISOString().slice(0, 16) : ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignment details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssignment = async () => {
    try {
      setLoading(true);
      
      const assignmentData = {
        ...assignment,
        courseId,
        settings: {
          ...assignment.settings,
          lateSubmissionPenalty: parseInt(assignment.settings.lateSubmissionPenalty) || 0,
          maxFileSize: parseInt(assignment.settings.maxFileSize) || 10,
          maxFiles: parseInt(assignment.settings.maxFiles) || 5
        }
      };

      const response = assignmentId ? 
        await axiosInstance.put(`/api/v1/instructor/assessment/assignment/${assignmentId}`, assignmentData) :
        await axiosInstance.post('/api/v1/instructor/assessment/assignment', assignmentData);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Assignment ${assignmentId ? 'updated' : 'created'} successfully.`,
        });
        
        if (!assignmentId) {
          navigate(`/instructor/assignment/${response.data.data._id}/edit`);
        }
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save assignment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAssignment = async () => {
    try {
      if (assignment.rubric.length === 0) {
        toast({
          title: 'Error',
          description: 'Cannot publish assignment without rubric criteria.',
          variant: 'destructive',
        });
        return;
      }

      const response = await axiosInstance.put(`/api/v1/instructor/assessment/assignment/${assignmentId}/publish`, {
        isPublished: !assignment.isPublished
      });

      if (response.data.success) {
        setAssignment(prev => ({ ...prev, isPublished: !prev.isPublished }));
        toast({
          title: 'Success',
          description: `Assignment ${assignment.isPublished ? 'unpublished' : 'published'} successfully.`,
        });
      }
    } catch (error) {
      console.error('Error publishing assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment status.',
        variant: 'destructive',
      });
    }
  };

  const handleAddCriterion = () => {
    if (!newCriterion.criterion.trim()) {
      toast({
        title: 'Error',
        description: 'Criterion name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (editingCriterion !== null) {
      setAssignment(prev => ({
        ...prev,
        rubric: prev.rubric.map((criterion, index) => 
          index === editingCriterion ? newCriterion : criterion
        )
      }));
    } else {
      setAssignment(prev => ({
        ...prev,
        rubric: [...prev.rubric, newCriterion]
      }));
    }

    setShowRubricDialog(false);
    setEditingCriterion(null);
    resetNewCriterion();
    
    toast({
      title: 'Success',
      description: `Rubric criterion ${editingCriterion !== null ? 'updated' : 'added'} successfully.`,
    });
  };

  const handleEditCriterion = (index) => {
    setEditingCriterion(index);
    setNewCriterion(assignment.rubric[index]);
    setShowRubricDialog(true);
  };

  const handleDeleteCriterion = (index) => {
    setAssignment(prev => ({
      ...prev,
      rubric: prev.rubric.filter((_, i) => i !== index)
    }));
    
    toast({
      title: 'Success',
      description: 'Rubric criterion deleted successfully.',
    });
  };

  const resetNewCriterion = () => {
    setNewCriterion({
      criterion: '',
      description: '',
      levels: [
        { name: 'Excellent', points: 25, description: '' },
        { name: 'Good', points: 20, description: '' },
        { name: 'Satisfactory', points: 15, description: '' },
        { name: 'Needs Improvement', points: 10, description: '' }
      ]
    });
  };

  const updateLevel = (levelIndex, field, value) => {
    setNewCriterion(prev => ({
      ...prev,
      levels: prev.levels.map((level, index) => 
        index === levelIndex ? { ...level, [field]: value } : level
      )
    }));
  };

  const calculateTotalPoints = () => {
    return assignment.rubric.reduce((total, criterion) => {
      const maxPoints = Math.max(...criterion.levels.map(level => level.points));
      return total + maxPoints;
    }, 0);
  };

  const handleFileTypeToggle = (fileType) => {
    setAssignment(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        allowedFileTypes: prev.settings.allowedFileTypes.includes(fileType)
          ? prev.settings.allowedFileTypes.filter(type => type !== fileType)
          : [...prev.settings.allowedFileTypes, fileType]
      }
    }));
  };

  if (loading && !assignment.title) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading assignment...</div>
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
              {assignmentId ? 'Edit Assignment' : 'Create New Assignment'}
            </h1>
            <p className="text-muted-foreground">
              {assignmentId ? 'Modify your assignment settings and rubric' : 'Create a comprehensive assignment for your students'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {assignment.isPublished && (
            <Badge className="bg-green-100 text-green-800">Published</Badge>
          )}
          <Button onClick={handleSaveAssignment} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Assignment'}
          </Button>
          {assignmentId && (
            <Button 
              variant={assignment.isPublished ? "outline" : "default"} 
              onClick={handlePublishAssignment}
            >
              {assignment.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      {/* Assignment Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assignment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Assignment Title</label>
            <Input
              value={assignment.title}
              onChange={(e) => setAssignment(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter assignment title..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={assignment.description}
              onChange={(e) => setAssignment(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the assignment..."
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Instructions</label>
            <Textarea
              value={assignment.instructions}
              onChange={(e) => setAssignment(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Detailed instructions for students..."
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Assignment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Due Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <Input
                type="datetime-local"
                value={assignment.settings.dueDate}
                onChange={(e) => setAssignment(prev => ({
                  ...prev,
                  settings: { ...prev.settings, dueDate: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Late Submission Deadline</label>
              <Input
                type="datetime-local"
                value={assignment.settings.lateSubmissionDeadline}
                onChange={(e) => setAssignment(prev => ({
                  ...prev,
                  settings: { ...prev.settings, lateSubmissionDeadline: e.target.value }
                }))}
              />
            </div>
          </div>

          {/* File Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Late Penalty (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={assignment.settings.lateSubmissionPenalty}
                onChange={(e) => setAssignment(prev => ({
                  ...prev,
                  settings: { ...prev.settings, lateSubmissionPenalty: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max File Size (MB)</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={assignment.settings.maxFileSize}
                onChange={(e) => setAssignment(prev => ({
                  ...prev,
                  settings: { ...prev.settings, maxFileSize: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Files</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={assignment.settings.maxFiles}
                onChange={(e) => setAssignment(prev => ({
                  ...prev,
                  settings: { ...prev.settings, maxFiles: e.target.value }
                }))}
              />
            </div>
          </div>

          {/* File Types */}
          <div>
            <label className="block text-sm font-medium mb-2">Allowed File Types</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {fileTypeOptions.map((fileType) => (
                <label key={fileType.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={assignment.settings.allowedFileTypes.includes(fileType.value)}
                    onChange={() => handleFileTypeToggle(fileType.value)}
                  />
                  <span className="text-sm">{fileType.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Boolean Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assignment.settings.plagiarismCheck}
                  onChange={(e) => setAssignment(prev => ({
                    ...prev,
                    settings: { ...prev.settings, plagiarismCheck: e.target.checked }
                  }))}
                />
                <span className="text-sm">Enable plagiarism detection</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assignment.settings.peerReview}
                  onChange={(e) => setAssignment(prev => ({
                    ...prev,
                    settings: { ...prev.settings, peerReview: e.target.checked }
                  }))}
                />
                <span className="text-sm">Enable peer review</span>
              </label>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={assignment.settings.anonymousSubmission}
                  onChange={(e) => setAssignment(prev => ({
                    ...prev,
                    settings: { ...prev.settings, anonymousSubmission: e.target.checked }
                  }))}
                />
                <span className="text-sm">Anonymous submissions</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rubric Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Grading Rubric ({assignment.rubric?.length || 0} criteria)
            <Badge variant="outline">{calculateTotalPoints()} points total</Badge>
          </CardTitle>
          <Button onClick={() => setShowRubricDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Criterion
          </Button>
        </CardHeader>
        <CardContent>
          {assignment.rubric?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No rubric criteria added yet. Click "Add Criterion" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {assignment.rubric?.map((criterion, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{criterion.criterion}</h4>
                      {criterion.description && (
                        <p className="text-sm text-muted-foreground mt-1">{criterion.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCriterion(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCriterion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {criterion.levels?.map((level, levelIndex) => (
                      <div key={levelIndex} className="border rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{level.name}</span>
                          <Badge variant="outline">{level.points} pts</Badge>
                        </div>
                        {level.description && (
                          <p className="text-xs text-muted-foreground">{level.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rubric Dialog */}
      <Dialog open={showRubricDialog} onOpenChange={setShowRubricDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCriterion !== null ? 'Edit Rubric Criterion' : 'Add Rubric Criterion'}
            </DialogTitle>
            <DialogDescription>
              Define grading criteria and performance levels
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Criterion Name</label>
              <Input
                value={newCriterion.criterion}
                onChange={(e) => setNewCriterion(prev => ({ ...prev, criterion: e.target.value }))}
                placeholder="e.g., Content Quality, Organization, Grammar..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={newCriterion.description}
                onChange={(e) => setNewCriterion(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this criterion evaluates..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Performance Levels</label>
              <div className="space-y-3">
                {newCriterion.levels.map((level, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium mb-1">Level Name</label>
                        <Input
                          value={level.name}
                          onChange={(e) => updateLevel(index, 'name', e.target.value)}
                          placeholder="e.g., Excellent, Good..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Points</label>
                        <Input
                          type="number"
                          min="0"
                          value={level.points}
                          onChange={(e) => updateLevel(index, 'points', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Description</label>
                      <Textarea
                        value={level.description}
                        onChange={(e) => updateLevel(index, 'description', e.target.value)}
                        placeholder="Describe performance at this level..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRubricDialog(false);
                setEditingCriterion(null);
                resetNewCriterion();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCriterion}>
              {editingCriterion !== null ? 'Update Criterion' : 'Add Criterion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentCreator;
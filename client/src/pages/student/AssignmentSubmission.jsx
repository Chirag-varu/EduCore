import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  Upload, 
  File, 
  Trash2, 
  Save, 
  Send, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  FileText,
  Download,
  Eye
} from 'lucide-react';

const AssignmentSubmission = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  useEffect(() => {
    fetchAssignmentData();
  }, [assignmentId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (submission && (submissionText || uploadedFiles.length > 0)) {
        handleAutoSave();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [submissionText, uploadedFiles, submission]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/v1/student/assessment/assignment/${assignmentId}`);
      
      if (response.data.success) {
        const { assignment: assignmentData, submission: submissionData } = response.data.data;
        setAssignment(assignmentData);
        setSubmission(submissionData);
        
        // Load existing submission data
        if (submissionData) {
          setSubmissionText(submissionData.submissionText || '');
          setUploadedFiles(submissionData.files || []);
        }
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignment data.',
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
      await axiosInstance.put(`/api/v1/student/assessment/assignment-submission/${submission._id}/save`, {
        submissionText,
        files: uploadedFiles.map(file => ({
          filename: file.filename,
          originalName: file.originalName,
          url: file.url,
          size: file.size
        }))
      });
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (!files.length) return;

    // Validate file count
    if (uploadedFiles.length + files.length > assignment.settings.maxFiles) {
      toast({
        title: 'Too Many Files',
        description: `You can only upload up to ${assignment.settings.maxFiles} files.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate file types and sizes
    for (const file of files) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!assignment.settings.allowedFileTypes.includes(fileExtension)) {
        toast({
          title: 'Invalid File Type',
          description: `${file.name} is not an allowed file type.`,
          variant: 'destructive',
        });
        return;
      }

      if (file.size > assignment.settings.maxFileSize * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: `${file.name} exceeds the maximum file size of ${assignment.settings.maxFileSize}MB.`,
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setUploading(true);
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axiosInstance.post(
          `/api/v1/student/assessment/assignment-submission/${submission._id}/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success) {
          setUploadedFiles(prev => [...prev, response.data.data.file]);
          setAutoSaveStatus('unsaved');
        }
      }
      
      toast({
        title: 'Success',
        description: `${files.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload files. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileRemove = async (fileId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/v1/student/assessment/assignment-submission/${submission._id}/file/${fileId}`
      );

      if (response.data.success) {
        setUploadedFiles(prev => prev.filter(file => file._id !== fileId));
        setAutoSaveStatus('unsaved');
        toast({
          title: 'Success',
          description: 'File removed successfully.',
        });
      }
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove file.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitAssignment = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await axiosInstance.post(
        `/api/v1/student/assessment/assignment-submission/${submission._id}/submit`,
        {
          submissionText,
          files: uploadedFiles.map(file => ({
            filename: file.filename,
            originalName: file.originalName,
            url: file.url,
            size: file.size
          }))
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Assignment submitted successfully!',
        });
        navigate(`/student/assignment/${assignmentId}/result`);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit assignment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isOverdue = () => {
    if (!assignment?.settings?.dueDate) return false;
    return new Date() > new Date(assignment.settings.dueDate);
  };

  const isLateSubmissionAllowed = () => {
    if (!assignment?.settings?.lateSubmissionDeadline) return false;
    return new Date() <= new Date(assignment.settings.lateSubmissionDeadline);
  };

  const getDaysUntilDue = () => {
    if (!assignment?.settings?.dueDate) return null;
    const now = new Date();
    const dueDate = new Date(assignment.settings.dueDate);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment || !submission) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Assignment Not Available</h2>
          <p className="text-muted-foreground">This assignment is not accessible or has been removed.</p>
        </div>
      </div>
    );
  }

  if (submission.submittedAt) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-6">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Assignment Submitted</h2>
          <p className="text-muted-foreground mb-4">
            Submitted on {new Date(submission.submittedAt).toLocaleDateString()} at{' '}
            {new Date(submission.submittedAt).toLocaleTimeString()}
          </p>
          <Button onClick={() => navigate(`/student/assignment/${assignmentId}/result`)}>
            View Submission Details
          </Button>
        </div>

        {/* Show submitted content */}
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.submissionText && (
              <div>
                <h4 className="font-medium mb-2">Written Response:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{submission.submissionText}</p>
                </div>
              </div>
            )}
            
            {submission.files?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Submitted Files:</h4>
                <div className="space-y-2">
                  {submission.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.originalName}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue();
  const canSubmit = !isOverdue() || isLateSubmissionAllowed();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{assignment.title}</h1>
            <p className="text-muted-foreground mt-1">{assignment.description}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              autoSaveStatus === 'saved' ? 'bg-green-500' :
              autoSaveStatus === 'saving' ? 'bg-yellow-500' :
              autoSaveStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span className="capitalize">{autoSaveStatus}</span>
          </div>
        </div>

        {/* Due Date Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Due: {new Date(assignment.settings.dueDate).toLocaleDateString()} at {new Date(assignment.settings.dueDate).toLocaleTimeString()}</span>
          </div>
          
          {daysUntilDue !== null && (
            <Badge variant={daysUntilDue < 0 ? "destructive" : daysUntilDue <= 1 ? "secondary" : "outline"}>
              {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
               daysUntilDue === 0 ? 'Due today' :
               `${daysUntilDue} days remaining`}
            </Badge>
          )}
          
          {isOverdue() && isLateSubmissionAllowed() && (
            <Badge variant="secondary">
              Late submission allowed until {new Date(assignment.settings.lateSubmissionDeadline).toLocaleDateString()}
              ({assignment.settings.lateSubmissionPenalty}% penalty)
            </Badge>
          )}
        </div>
      </div>

      {/* Assignment Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{assignment.instructions}</div>
          
          {/* File Requirements */}
          {assignment.settings.allowedFileTypes.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">File Requirements:</h4>
              <ul className="text-sm space-y-1">
                <li>• Maximum {assignment.settings.maxFiles} files</li>
                <li>• Maximum {assignment.settings.maxFileSize}MB per file</li>
                <li>• Allowed types: {assignment.settings.allowedFileTypes.join(', ')}</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Form */}
      {canSubmit ? (
        <>
          {/* Text Submission */}
          <Card>
            <CardHeader>
              <CardTitle>Written Response</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={submissionText}
                onChange={(e) => {
                  setSubmissionText(e.target.value);
                  setAutoSaveStatus('unsaved');
                }}
                placeholder="Enter your written response here..."
                rows={10}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* File Upload */}
          {assignment.settings.allowedFileTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>File Uploads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    accept={assignment.settings.allowedFileTypes.map(type => `.${type}`).join(',')}
                    className="hidden"
                  />
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-muted-foreground mb-2">
                    Drag and drop files here, or click to select files
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || uploadedFiles.length >= assignment.settings.maxFiles}
                  >
                    {uploading ? 'Uploading...' : 'Select Files'}
                  </Button>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Files ({uploadedFiles.length}/{assignment.settings.maxFiles})</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={file._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{file.originalName}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleFileRemove(file._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleAutoSave}
              disabled={autoSaveStatus === 'saving'}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            <Button 
              onClick={() => setShowSubmitDialog(true)}
              disabled={!submissionText && uploadedFiles.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Assignment
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Submission Period Closed</h3>
            <p className="text-muted-foreground">
              {!isLateSubmissionAllowed() ? 
                'The deadline for this assignment has passed and late submissions are not allowed.' :
                'This assignment is no longer accepting submissions.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your assignment? Once submitted, you cannot make any changes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Written response:</span>
              <span className="font-medium">{submissionText ? 'Included' : 'Not included'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Files uploaded:</span>
              <span className="font-medium">{uploadedFiles.length} files</span>
            </div>
            
            {isOverdue() && isLateSubmissionAllowed() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    This is a late submission. A {assignment.settings.lateSubmissionPenalty}% penalty will be applied.
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Working
            </Button>
            <Button 
              onClick={handleSubmitAssignment} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentSubmission;
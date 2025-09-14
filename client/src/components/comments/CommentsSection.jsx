import React, { useState, useEffect, useContext } from 'react';
import axios from '@/api/axiosInstance';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { MessageSquare, AlertCircle } from 'lucide-react';

const CommentsSection = ({ courseId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  const { toast } = useToast();
  const { auth } = useContext(AuthContext);
  
  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/comments/course/${courseId}`);
      setComments(res.data.data);
      
      // Check if current user has already reviewed
      if (auth?.user?._id) {
        const userHasReviewed = res.data.data.some(
          comment => comment.userId === auth.user._id
        );
        setHasUserReviewed(userHasReviewed);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if the user is enrolled in this course
  const checkEnrollmentStatus = async () => {
    if (!auth?.user?._id) {
      setIsUserEnrolled(false);
      return;
    }
    
    try {
      // Check if user has access to this course
      const res = await axios.get(`/api/v1/student/courses-bought/check/${courseId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      
      setIsUserEnrolled(res.data.success && res.data.data);
    } catch (err) {
      console.error('Error checking course enrollment:', err);
      setIsUserEnrolled(false);
    }
  };
  
  useEffect(() => {
    if (courseId) {
      fetchComments();
      checkEnrollmentStatus();
    }
  }, [courseId, auth?.user?._id]);
  
  const handleAddComment = async (commentData) => {
    try {
      const res = await axios.post(
        `/comments/course/${courseId}`, 
        commentData,
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      
      // Add the new comment to the list
      setComments([res.data.data, ...comments]);
      setHasUserReviewed(true);
      
      toast({
        title: "Success",
        description: "Your review has been added!",
      });
      
      return res.data;
    } catch (err) {
      console.error('Error adding comment:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add your review",
        variant: "destructive",
      });
      throw err;
    }
  };
  
  const handleEditComment = async (commentId, updatedData) => {
    try {
      const res = await axios.put(
        `/comments/${commentId}`, 
        {
          ...updatedData,
          userId: auth?.user?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      
      // Update the comment in the list
      setComments(comments.map(c => 
        c._id === commentId ? res.data.data : c
      ));
      
      toast({
        title: "Success",
        description: "Your review has been updated!",
      });
    } catch (err) {
      console.error('Error updating comment:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update your review",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      await axios.delete(`/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
        data: { userId: auth?.user?._id },
      });
      
      // Remove the comment from the list
      setComments(comments.filter(c => c._id !== commentId));
      setHasUserReviewed(false);
      
      toast({
        title: "Success",
        description: "Your review has been deleted!",
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete your review",
        variant: "destructive",
      });
    }
  };
  
  const handleReportComment = (commentId) => {
    toast({
      title: "Report Submitted",
      description: "Thank you for your feedback. We'll review this comment.",
    });
  };
  
  // Calculate average rating
  const avgRating = comments.length 
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : 0;
  
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-blue-50 p-5 rounded-lg mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {comments.length > 0 ? avgRating : "No"} out of 5
                </h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <MessageSquare size={16} />
                  <span>
                    {comments.length} {comments.length === 1 ? 'review' : 'reviews'}
                  </span>
                </p>
              </div>
              
              {auth?.authenticate && !hasUserReviewed && (
                <p className="text-blue-700">Share your thoughts about this course!</p>
              )}
            </div>
          </div>
          
          {/* Add Comment Form */}
          {auth?.authenticate ? (
            isUserEnrolled ? (
              !hasUserReviewed ? (
                <CommentForm 
                  courseId={courseId}
                  userId={auth.user._id}
                  userName={auth.user.userName}
                  onSubmit={handleAddComment}
                />
              ) : (
                <p className="text-gray-500 italic mb-6">
                  You've already reviewed this course. You can edit or delete your review below.
                </p>
              )
            ) : (
              <p className="text-amber-700 bg-amber-50 p-4 rounded-md mb-6 border-l-4 border-amber-500">
                You need to enroll in this course before you can leave a review.
              </p>
            )
          ) : (
            <p className="text-gray-600 bg-gray-50 p-4 rounded-md mb-6">
              Please <a href="/auth" className="text-blue-600 hover:underline">sign in</a> to leave a review.
            </p>
          )}
          
          {/* Comments List */}
          <div className="mt-6">
            {comments.length > 0 ? (
              comments.map(comment => (
                <CommentItem 
                  key={comment._id}
                  comment={comment}
                  currentUserId={auth?.user?._id}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  onReport={handleReportComment}
                />
              ))
            ) : (
              <div className="text-center py-8 border-t">
                <p className="text-gray-500">No reviews yet. Be the first to review this course!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentsSection;
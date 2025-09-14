import React, { useState, useEffect, useContext } from 'react';
import axios from '@/api/axiosInstance';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import ReviewSummary from './ReviewSummary';
import { MessageSquare, AlertCircle, ChevronDown, Filter, SortAsc, SortDesc } from 'lucide-react';

const CommentsSection = ({ courseId }) => {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'highest', 'lowest'
  const [filterRating, setFilterRating] = useState(0); // 0 = all ratings, 1-5 for specific ratings
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
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
  
  // Apply filtering and sorting
  const applyFiltersAndSort = (commentsArray) => {
    // First apply rating filter
    let result = commentsArray;
    
    if (filterRating > 0) {
      result = result.filter(comment => comment.rating === filterRating);
    }
    
    // Then apply sorting
    switch (sortOption) {
      case 'newest':
        return [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'highest':
        return [...result].sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return [...result].sort((a, b) => a.rating - b.rating);
      default:
        return result;
    }
  };
  
  // Update filtered comments whenever comments, filter or sort options change
  useEffect(() => {
    setFilteredComments(applyFiltersAndSort(comments));
  }, [comments, filterRating, sortOption]);
  
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
      const updatedComments = [res.data.data, ...comments];
      setComments(updatedComments);
      setFilteredComments(applyFiltersAndSort(updatedComments));
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
      const updatedComments = comments.map(c => 
        c._id === commentId ? res.data.data : c
      );
      setComments(updatedComments);
      setFilteredComments(applyFiltersAndSort(updatedComments));
      
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
      const updatedComments = comments.filter(c => c._id !== commentId);
      setComments(updatedComments);
      setFilteredComments(applyFiltersAndSort(updatedComments));
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
          
          {/* Rating summary visualization */}
          {comments.length > 0 && <ReviewSummary comments={comments} />}
          
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
          
          {/* Sort and Filter Controls */}
          {comments.length > 0 && (
            <div className="flex flex-wrap justify-between items-center mb-4 mt-8 gap-2">
              {/* Sort Options */}
              <div className="flex items-center">
                <SortAsc className="h-5 w-5 text-gray-500 mr-2" />
                <label className="text-gray-600 mr-2">Sort by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border border-gray-300 rounded-md px-2 py-1 bg-white text-sm"
                >
                  <option value="newest">Most Recent</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
              
              {/* Filter By Rating */}
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-500 mr-2" />
                <label className="text-gray-600 mr-2">Filter:</label>
                <select 
                  value={filterRating}
                  onChange={(e) => setFilterRating(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-2 py-1 bg-white text-sm"
                >
                  <option value={0}>All Ratings</option>
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
                
                {filterRating > 0 && (
                  <button 
                    onClick={() => setFilterRating(0)}
                    className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Comments List */}
          <div className="mt-6">
            {comments.length > 0 ? (
              filteredComments.length > 0 ? (
                filteredComments.map(comment => (
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
                <div className="text-center py-8 border-t border-gray-200">
                  <p className="text-gray-500">
                    No reviews match your current filter.
                    <button 
                      onClick={() => setFilterRating(0)}
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      View all reviews
                    </button>
                  </p>
                </div>
              )
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
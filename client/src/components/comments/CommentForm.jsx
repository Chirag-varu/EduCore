import React, { useState } from 'react';
import { Star } from 'lucide-react';

const CommentForm = ({ courseId, userId, userName, userAvatar, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating < 1 || !comment.trim()) {
      setError('Please provide both a rating and a comment');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onSubmit({
        courseId,
        userId,
        userName,
        rating,
        comment,
        title: title.trim() || undefined,
        userAvatar
      });
      
      // Reset form after successful submission
      setRating(5);
      setComment('');
      setTitle('');
    } catch (err) {
      setError(err.message || 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-gray-100 mb-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      
      {/* Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(i)}
              className="focus:outline-none"
            >
              <Star 
                className={`h-8 w-8 ${
                  (hoverRating || rating) >= i 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </div>
      </div>
      
      {/* Title (optional) */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Review Title (optional)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Summarize your review"
          maxLength={100}
        />
      </div>
      
      {/* Comment */}
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Review
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Tell others what you thought of this course..."
          required
        />
      </div>
      
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
          isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default CommentForm;
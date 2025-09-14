import React, { useState } from 'react';
import { Star, StarHalf, Edit, Trash2, Flag, Check, X } from 'lucide-react';

// Component to display star rating
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const stars = [];
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`star-${i}`} className="fill-yellow-400 text-yellow-400 h-5 w-5" />);
  }
  
  if (halfStar) {
    stars.push(<StarHalf key="half-star" className="fill-yellow-400 text-yellow-400 h-5 w-5" />);
  }
  
  // Add empty stars to make it always 5 stars
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="text-gray-300 h-5 w-5" />);
  }
  
  return <div className="flex">{stars}</div>;
};

const CommentItem = ({ 
  comment, 
  currentUserId, 
  onEdit, 
  onDelete, 
  onReport 
}) => {
  const [editing, setEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(comment.comment);
  const [editedRating, setEditedRating] = useState(comment.rating);
  
  const isOwner = currentUserId === comment.userId;
  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Check if this is a verified purchase
  const isVerifiedPurchase = comment.isVerifiedPurchase !== false;
  
  const handleSaveEdit = () => {
    onEdit(comment._id, {
      rating: editedRating,
      comment: editedComment
    });
    setEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditedComment(comment.comment);
    setEditedRating(comment.rating);
    setEditing(false);
  };
  
  return (
    <div className="border-b border-gray-200 py-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          {comment.userAvatar ? (
            <img 
              src={comment.userAvatar} 
              alt={comment.userName} 
              className="w-10 h-10 rounded-full" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-medium">
              {comment.userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="font-medium text-gray-900">{comment.userName}</h4>
            <div className="flex items-center gap-2">
              {!editing && <StarRating rating={comment.rating} />}
              <span className="text-sm text-gray-500">{formattedDate}</span>
              {comment.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
            </div>
            {isVerifiedPurchase && (
              <div className="mt-1">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-md font-medium flex items-center w-fit">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified Purchase
                </span>
              </div>
            )}
          </div>
        </div>
        
        {!editing && isOwner && (
          <div className="flex gap-2">
            <button 
              onClick={() => setEditing(true)}
              className="text-gray-500 hover:text-blue-600"
              title="Edit comment"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={() => onDelete(comment._id)}
              className="text-gray-500 hover:text-red-600"
              title="Delete comment"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
        
        {!editing && !isOwner && (
          <button 
            onClick={() => onReport(comment._id)}
            className="text-gray-500 hover:text-orange-600"
            title="Report comment"
          >
            <Flag size={16} />
          </button>
        )}
      </div>
      
      {editing ? (
        <div className="mt-3">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select 
              value={editedRating} 
              onChange={(e) => setEditedRating(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSaveEdit}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              <Check size={16} />
              Save
            </button>
            <button 
              onClick={handleCancelEdit}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 mt-1">{comment.comment}</p>
      )}
    </div>
  );
};

export default CommentItem;
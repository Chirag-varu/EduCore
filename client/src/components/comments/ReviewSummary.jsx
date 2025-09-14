import React from 'react';
import { Star } from 'lucide-react';

const ReviewSummary = ({ comments }) => {
  // Calculate the distribution of ratings
  const ratingCounts = {
    5: comments.filter(c => c.rating === 5).length,
    4: comments.filter(c => c.rating === 4).length,
    3: comments.filter(c => c.rating === 3).length,
    2: comments.filter(c => c.rating === 2).length,
    1: comments.filter(c => c.rating === 1).length
  };

  // Calculate percentage for each rating
  const total = comments.length;
  const percentages = {
    5: total > 0 ? Math.round((ratingCounts[5] / total) * 100) : 0,
    4: total > 0 ? Math.round((ratingCounts[4] / total) * 100) : 0,
    3: total > 0 ? Math.round((ratingCounts[3] / total) * 100) : 0,
    2: total > 0 ? Math.round((ratingCounts[2] / total) * 100) : 0,
    1: total > 0 ? Math.round((ratingCounts[1] / total) * 100) : 0
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6">
      <h3 className="font-semibold text-lg mb-4">Rating Breakdown</h3>
      
      {[5, 4, 3, 2, 1].map(rating => (
        <div key={rating} className="flex items-center mb-2 gap-2">
          <div className="flex items-center w-20 text-sm">
            <span className="mr-1">{rating}</span>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
          
          <div className="flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full" 
              style={{ width: `${percentages[rating]}%` }}
            />
          </div>
          
          <div className="text-sm text-gray-500 w-16 text-right">
            {ratingCounts[rating]} ({percentages[rating]}%)
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewSummary;
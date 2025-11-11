import React from "react";

export default function CourseProgressBar({ percentage = 0, className = "" }) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(percentage) ? percentage : 0));
  return (
    <div className={`w-full space-y-2 ${className}`} aria-label="Course progress">
      <div className="flex items-center justify-between text-sm text-gray-300">
        <span>Progress</span>
        <span className="font-semibold text-white">{pct}%</span>
      </div>
      <div className="w-full bg-gray-700/70 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

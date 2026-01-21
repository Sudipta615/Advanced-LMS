import React from 'react';

interface ProgressBarProps {
  percentage: number;
  className?: string;
}

export function ProgressBar({ percentage, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div 
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      ></div>
    </div>
  );
}
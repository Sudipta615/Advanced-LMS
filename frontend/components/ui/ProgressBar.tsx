import React from 'react';

interface ProgressBarProps {
  percentage: number;
  className?: string;
  label?: string;
}

export function ProgressBar({ percentage, className = '', label = 'Progress' }: ProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}
      role="progressbar"
      aria-valuenow={clampedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${clampedPercentage}%` }}
        aria-hidden="true"
      ></div>
    </div>
  );
}
"use client";

import { ShoppingCart, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface EnrollButtonProps {
  courseId: string;
  price: number;
  isEnrolled: boolean;
  onEnroll: () => void;
  loading: boolean;
}

export function EnrollButton({ courseId, price, isEnrolled, onEnroll, loading }: EnrollButtonProps) {
  if (isEnrolled) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 bg-green-100 text-green-700 rounded-lg">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Already Enrolled</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">
          {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
        </div>
        {price > 0 && (
          <p className="text-sm text-gray-500 mt-1">One-time payment</p>
        )}
      </div>
      
      <button
        onClick={onEnroll}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <LoadingSpinner />
            Enrolling...
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            {price === 0 ? 'Enroll for Free' : 'Enroll Now'}
          </>
        )}
      </button>
      
      {price > 0 && (
        <p className="text-xs text-center text-gray-500">
          30-day money-back guarantee
        </p>
      )}
    </div>
  );
}

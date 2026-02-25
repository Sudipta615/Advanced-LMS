"use client";

import { Play, Clock, BookOpen, Award } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Instructor {
  first_name: string;
  last_name: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  difficulty_level: string;
  estimated_hours: number;
  instructor: Instructor;
  category: {
    name: string;
  };
}

interface Enrollment {
  id: string;
  course_id: string;
  status: string;
  completion_percentage: number;
  enrolled_at: string;
  last_accessed_at: string | null;
  course: Course;
}

interface EnrolledCourseCardProps {
  enrollment: Enrollment;
  onContinueLearning: (courseId: string) => void;
}

export function EnrolledCourseCard({ enrollment, onContinueLearning }: EnrolledCourseCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'dropped':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-orange-100 text-orange-700';
      case 'expert':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-40 bg-gray-200">
        {enrollment.course.thumbnail_url ? (
          <img
            src={enrollment.course.thumbnail_url}
            alt={enrollment.course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
        </span>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500">{enrollment.course.category?.name || 'Uncategorized'}</span>
        </div>
        
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{enrollment.course.title}</h3>
        
        <p className="text-gray-600 text-sm mb-3">
          By {enrollment.course.instructor.first_name} {enrollment.course.instructor.last_name}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(enrollment.course.difficulty_level)}`}>
            {enrollment.course.difficulty_level.charAt(0).toUpperCase() + enrollment.course.difficulty_level.slice(1)}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {enrollment.course.estimated_hours}h
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{Math.round(enrollment.completion_percentage)}%</span>
          </div>
          <ProgressBar percentage={enrollment.completion_percentage} />
        </div>
        
        {enrollment.status === 'completed' ? (
          <div className="flex items-center justify-center gap-2 py-2 bg-green-100 text-green-700 rounded-lg">
            <Award className="w-5 h-5" />
            <span className="font-medium">Completed</span>
          </div>
        ) : (
          <button
            onClick={() => onContinueLearning(enrollment.course_id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Continue Learning
          </button>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Enrolled: {formatDate(enrollment.enrolled_at)}</span>
            {enrollment.last_accessed_at && (
              <span>Last: {formatDate(enrollment.last_accessed_at)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

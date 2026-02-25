"use client";

import { 
  Edit, 
  BarChart2, 
  Eye, 
  Users, 
  Clock,
  DollarSign,
  BookOpen
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  status: string;
  difficulty_level: string;
  estimated_hours: number;
  price: number;
  category: {
    name: string;
  };
  created_at: string;
  enrollment_count: number;
}

interface InstructorCourseCardProps {
  course: Course;
  onEdit: (courseId: string) => void;
  onViewAnalytics: (courseId: string) => void;
}

export function InstructorCourseCard({ course, onEdit, onViewAnalytics }: InstructorCourseCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
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
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
        </span>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500">{course.category?.name || 'Uncategorized'}</span>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
            {course.difficulty_level.charAt(0).toUpperCase() + course.difficulty_level.slice(1)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.enrollment_count || 0} students</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.estimated_hours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>{course.price === 0 ? 'Free' : `$${course.price}`}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(course.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => onViewAnalytics(course.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            <BarChart2 className="w-4 h-4" />
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

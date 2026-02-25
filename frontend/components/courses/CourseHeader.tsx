"use client";

import { ArrowLeft, Clock, Users, Star, Globe, BookOpen } from 'lucide-react';

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
}

interface Category {
  name: string;
  slug: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  thumbnail_url: string | null;
  difficulty_level: string;
  estimated_hours: number;
  price: number;
  language: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  instructor: Instructor;
  category: Category;
  isEnrolled: boolean;
  enrollmentStatus: string | null;
  completionPercentage: number;
}

interface CourseHeaderProps {
  course: Course;
  onBack: () => void;
}

export function CourseHeader({ course, onBack }: CourseHeaderProps) {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'advanced':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'expert':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
      
      {course.thumbnail_url && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${course.thumbnail_url})` }}
        />
      )}
      
      <div className="relative px-4 py-8 md:py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </button>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm">
                {course.category?.name || 'Uncategorized'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(course.difficulty_level)}`}>
                {course.difficulty_level.charAt(0).toUpperCase() + course.difficulty_level.slice(1)}
              </span>
              {course.is_featured && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  Featured
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {course.title}
            </h1>
            
            <p className="text-lg text-white/90 mb-6 max-w-3xl">
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {course.instructor.profile_picture_url ? (
                    <img 
                      src={course.instructor.profile_picture_url} 
                      alt={`${course.instructor.first_name} ${course.instructor.last_name}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {course.instructor.first_name[0]}{course.instructor.last_name[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-white/60">Instructor</p>
                  <p className="text-white font-medium">
                    {course.instructor.first_name} {course.instructor.last_name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{course.estimated_hours} hours</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span>{course.language}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{course.language}</span>
              </div>
            </div>
          </div>
          
          <div className="md:text-right">
            <div className="inline-block bg-white rounded-lg shadow-lg p-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
              </div>
              {course.isEnrolled && (
                <div className="text-green-600 font-medium">
                  ✓ Enrolled
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

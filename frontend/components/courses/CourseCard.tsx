import React from 'react';
import Image from 'next/image';
import { ProgressBar } from '../ui/ProgressBar';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string | null;
    instructor: {
      first_name: string;
      last_name: string;
    };
    difficulty_level: string;
    price: number;
    estimated_hours: number;
    category: {
      name: string;
    };
    isEnrolled: boolean;
    completionPercentage: number;
    enrollmentStatus: string | null;
  };
  onEnroll: (courseId: string) => void;
  onClick: () => void;
}

export function CourseCard({ course, onEnroll, onClick }: CourseCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const difficultyLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  };

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onEnroll(course.id);
  };

  const cardOnClick = () => {
    onClick();
  };

  return (
    <article
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      aria-labelledby={`course-title-${course.id}`}
    >
      <div className="relative h-48">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={`Thumbnail for ${course.title}`}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="h-full bg-gray-200 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        {course.isEnrolled && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
            Enrolled
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyColors[course.difficulty_level] || 'bg-gray-100 text-gray-800'}`}
            aria-label={`Difficulty level: ${difficultyLabels[course.difficulty_level as keyof typeof difficultyLabels] || course.difficulty_level}`}
          >
            {course.difficulty_level}
          </span>
          <span className="text-lg font-bold text-blue-600" aria-label={`Price: ${course.price > 0 ? `${course.price.toFixed(2)}` : 'Free'}`}>
            {course.price > 0 ? `${course.price.toFixed(2)}` : 'FREE'}
          </span>
        </div>

        <h3
          id={`course-title-${course.id}`}
          className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2"
        >
          {course.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {course.description}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>Instructor: {course.instructor.first_name} {course.instructor.last_name}</span>
          <span className="mx-2" aria-hidden="true">•</span>
          <span>Duration: {course.estimated_hours} hours</span>
        </div>

        {course.isEnrolled ? (
          <div className="mt-4">
            <ProgressBar
              percentage={course.completionPercentage}
              className="mb-2"
              label={`${course.title} completion progress`}
            />
            <button
              onClick={cardOnClick}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              {course.enrollmentStatus === 'completed' ? 'View Course' : 'Continue Learning'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleEnrollClick}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            aria-label={`Enroll in ${course.title}`}
          >
            Enroll Now
          </button>
        )}
      </div>
    </article>
  );
}
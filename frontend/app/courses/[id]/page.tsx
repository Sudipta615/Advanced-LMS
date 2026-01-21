"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CourseHeader } from '@/components/courses/CourseHeader';
import { CourseContentPreview } from '@/components/courses/CourseContentPreview';
import { EnrollButton } from '@/components/courses/EnrollButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

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
  instructor: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture_url: string | null;
  };
  category: {
    name: string;
    slug: string;
  };
  sections: Array<{
    id: string;
    title: string;
    description: string | null;
    display_order: number;
    lessons: Array<{
      id: string;
      title: string;
      description: string | null;
      lesson_type: string;
      duration_minutes: number | null;
      is_published: boolean;
    }>;
  }>;
  prerequisites: Array<{
    course_id: string;
    title: string;
    slug: string;
    min_completion_percentage: number;
  }>;
  tags: string[];
  isEnrolled: boolean;
  enrollmentStatus: string | null;
  completionPercentage: number;
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  
  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/courses/${params.id}`);
      setCourse(response.data.data);
    } catch (err) {
      console.error('Failed to fetch course:', err);
      setError('Failed to load course details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCourse();
  }, [params.id]);
  
  const handleEnroll = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      setEnrollmentLoading(true);
      await api.post('/api/enrollments', { course_id: params.id });
      
      // Refresh course data to update enrollment status
      await fetchCourse();
    } catch (err) {
      console.error('Enrollment failed:', err);
      setError(err.response?.data?.message || 'Failed to enroll in course. Please try again.');
    } finally {
      setEnrollmentLoading(false);
    }
  };
  
  const handleContinueLearning = () => {
    if (course?.isEnrolled) {
      router.push(`/learning/${params.id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message={error} />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message="Course not found" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <CourseHeader 
        course={course} 
        onBack={() => router.push('/courses')} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Course Description</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{course.description}</p>
              {course.content && (
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">Course Content</h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: course.content }} />
                </div>
              )}
            </div>
          </div>
          
          <CourseContentPreview 
            sections={course.sections} 
            isEnrolled={course.isEnrolled} 
          />
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            {course.isEnrolled ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Your Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${course.completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {Math.round(course.completionPercentage)}% Complete
                </p>
                <button 
                  onClick={handleContinueLearning} 
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue Learning
                </button>
              </div>
            ) : (
              <EnrollButton 
                courseId={course.id} 
                price={course.price} 
                isEnrolled={course.isEnrolled} 
                onEnroll={handleEnroll} 
                loading={enrollmentLoading} 
              />
            )}
            
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Course Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">Difficulty:</span>
                  <span className="capitalize">{course.difficulty_level}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">Duration:</span>
                  <span>{course.estimated_hours} hours</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">Language:</span>
                  <span>{course.language}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">Category:</span>
                  <span className="capitalize">{course.category.name}</span>
                </div>
              </div>
            </div>
            
            {course.tags && course.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Prerequisites</h3>
                <ul className="space-y-2">
                  {course.prerequisites.map((prerequisite) => (
                    <li key={prerequisite.course_id} className="flex items-center">
                      <span className="text-green-600 mr-2">●</span>
                      <span>{prerequisite.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
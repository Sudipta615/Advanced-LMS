"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CourseContentEditor } from '@/components/courses/CourseContentEditor';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

interface Section {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  lessons: Array<{
    id: string;
    title: string;
    description: string | null;
    lesson_type: string;
    display_order: number;
    is_published: boolean;
  }>;
}

interface Course {
  id: string;
  title: string;
  status: string;
}

export default function CourseContentPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch course
      const courseResponse = await api.get(`/api/courses/${params.id}`);
      setCourse(courseResponse.data.data);
      
      // Fetch sections and lessons
      const sectionsResponse = await api.get(`/api/courses/${params.id}/sections`);
      setSections(sectionsResponse.data.data);
    } catch (err) {
      console.error('Failed to fetch course content:', err);
      setError('Failed to load course content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Check if user is instructor or admin
    if (user.role !== 'instructor' && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    fetchCourseContent();
  }, [user, params.id]);
  
  const handleSave = async () => {
    try {
      // Refresh data
      await fetchCourseContent();
      
      // Show success message
      setError(null);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to save changes:', err);
      setError('Failed to save changes. Please try again.');
    }
  };
  
  const handlePublish = async () => {
    try {
      await api.put(`/api/courses/${params.id}`, {
        status: 'published'
      });
      
      // Refresh course data
      const courseResponse = await api.get(`/api/courses/${params.id}`);
      setCourse(courseResponse.data.data);
      
      setError(null);
      // You could add a success toast here
    } catch (err) {
      console.error('Failed to publish course:', err);
      setError(err.response?.data?.message || 'Failed to publish course. Please try again.');
    }
  };
  
  if (!user) {
    return null;
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Course Content: {course?.title}</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push(`/instructor/courses/${params.id}/edit`)} 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Edit Course Info
          </button>
          <button 
            onClick={() => router.push('/instructor/courses')} 
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}
      
      <div className="flex justify-end gap-4 mb-6">
        <button 
          onClick={handleSave} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
        {course?.status !== 'published' && (
          <button 
            onClick={handlePublish} 
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Publish Course
          </button>
        )}
      </div>
      
      {course && (
        <CourseContentEditor 
          courseId={course.id} 
          sections={sections} 
          onSectionsChange={setSections} 
        />
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CourseForm } from '@/components/courses/CourseForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

interface Category {
  id: string;
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
  category_id: string;
  difficulty_level: string;
  estimated_hours: number;
  price: number;
  language: string;
  status: string;
  visibility: string;
  is_featured: boolean;
  tags: string[];
  prerequisites: string[];
  required_score: number;
  allow_retake: boolean;
  max_attempts: number | null;
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch categories
      const categoriesResponse = await api.get('/api/courses?limit=100');
      // Extract unique categories from courses
      const uniqueCategories: Category[] = [];
      const seenCategoryIds = new Set();
      
      categoriesResponse.data.data.forEach((course: any) => {
        if (course.category && !seenCategoryIds.has(course.category.id)) {
          seenCategoryIds.add(course.category.id);
          uniqueCategories.push(course.category);
        }
      });
      
      setCategories(uniqueCategories);
      
      // Fetch course
      const courseResponse = await api.get(`/api/courses/${params.id}`);
      setCourse(courseResponse.data.data);
    } catch (err) {
      console.error('Failed to fetch course data:', err);
      setError('Failed to load course data. Please try again later.');
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
    
    fetchCourseData();
  }, [user, params.id]);
  
  const handleSubmit = async (formData: Omit<Course, 'id'>) => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await api.put(`/api/courses/${params.id}`, formData);
      
      router.push(`/instructor/courses/${params.id}/content`);
    } catch (err) {
      console.error('Failed to update course:', err);
      setError(err.response?.data?.message || 'Failed to update course. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    router.push(`/instructor/courses/${params.id}/content`);
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
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <button 
          onClick={() => router.push('/instructor/courses')} 
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Back to Courses
        </button>
      </div>
      
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}
      
      {course && (
        <CourseForm 
          course={course} 
          categories={categories} 
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
          isLoading={saving} 
        />
      )}
    </div>
  );
}
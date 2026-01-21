"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EnrolledCourseCard } from '@/components/courses/EnrolledCourseCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Pagination } from '@/components/ui/Pagination';

interface Enrollment {
  id: string;
  course_id: string;
  status: string;
  completion_percentage: number;
  enrolled_at: string;
  last_accessed_at: string | null;
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail_url: string | null;
    difficulty_level: string;
    estimated_hours: number;
    instructor: {
      first_name: string;
      last_name: string;
    };
    category: {
      name: string;
    };
  };
}

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1
  });
  
  const [filter, setFilter] = useState('active');
  
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: filter
      });
      
      const response = await api.get(`/api/enrollments?${params.toString()}`);
      
      setEnrollments(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
      setError('Failed to load your courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchEnrollments();
  }, [user, pagination.page, filter]);
  
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleContinueLearning = (courseId: string) => {
    router.push(`/learning/${courseId}`);
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={() => handleFilterChange('active')} 
          className={`px-4 py-2 rounded-lg ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Active Courses
        </button>
        <button 
          onClick={() => handleFilterChange('completed')} 
          className={`px-4 py-2 rounded-lg ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Completed Courses
        </button>
        <button 
          onClick={() => handleFilterChange('dropped')} 
          className={`px-4 py-2 rounded-lg ${filter === 'dropped' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Dropped Courses
        </button>
      </div>
      
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} />
        </div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-40 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {enrollments.length > 0 ? (
            enrollments.map((enrollment) => (
              <EnrolledCourseCard 
                key={enrollment.id} 
                enrollment={enrollment} 
                onContinueLearning={handleContinueLearning} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No courses found in this category.</p>
              <button 
                onClick={() => router.push('/courses')} 
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>
      )}
      
      <Pagination 
        currentPage={pagination.page} 
        totalPages={pagination.totalPages} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
}
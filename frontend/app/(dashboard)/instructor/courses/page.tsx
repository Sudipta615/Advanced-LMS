"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { InstructorCourseCard } from '@/components/courses/InstructorCourseCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Pagination } from '@/components/ui/Pagination';

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

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1
  });
  
  const [filter, setFilter] = useState('all');
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      const response = await api.get(`/api/courses?${params.toString()}`);
      
      // Filter courses by instructor
      const instructorCourses = response.data.data.filter((course: Course) => 
        course.instructor_id === user?.id || user?.role === 'admin'
      );
      
      setCourses(instructorCourses);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
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
    
    // Check if user is instructor or admin
    if (user.role !== 'instructor' && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    fetchCourses();
  }, [user, pagination.page, filter]);
  
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleCreateCourse = () => {
    router.push('/instructor/courses/create');
  };
  
  const handleEditCourse = (courseId: string) => {
    router.push(`/instructor/courses/${courseId}/edit`);
  };
  
  const handleViewAnalytics = (courseId: string) => {
    router.push(`/instructor/courses/${courseId}/analytics`);
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">My Courses</h1>
        <button 
          onClick={handleCreateCourse} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Course
        </button>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={() => handleFilterChange('all')} 
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          All Courses
        </button>
        <button 
          onClick={() => handleFilterChange('draft')} 
          className={`px-4 py-2 rounded-lg ${filter === 'draft' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Drafts
        </button>
        <button 
          onClick={() => handleFilterChange('published')} 
          className={`px-4 py-2 rounded-lg ${filter === 'published' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Published
        </button>
        <button 
          onClick={() => handleFilterChange('archived')} 
          className={`px-4 py-2 rounded-lg ${filter === 'archived' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Archived
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
          {courses.length > 0 ? (
            courses.map((course) => (
              <InstructorCourseCard 
                key={course.id} 
                course={course} 
                onEdit={handleEditCourse} 
                onViewAnalytics={handleViewAnalytics} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No courses found.</p>
              <button 
                onClick={handleCreateCourse} 
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Course
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
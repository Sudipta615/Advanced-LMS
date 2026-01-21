"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { CourseCard } from '@/components/courses/CourseCard';
import { SearchBar } from '@/components/courses/SearchBar';
import { FilterSidebar } from '@/components/courses/FilterSidebar';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/lib/auth';

interface Course {
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
    slug: string;
  };
  isEnrolled: boolean;
  completionPercentage: number;
  enrollmentStatus: string | null;
}

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  });
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    tags: '',
    sort: 'newest'
  });
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });
      
      const response = await api.get(`/api/courses?${params.toString()}`);
      
      setCourses(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCourses();
  }, [pagination.page, filters]);
  
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const handleEnroll = async (courseId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      await api.post('/api/enrollments', { course_id: courseId });
      // Refresh courses to update enrollment status
      fetchCourses();
    } catch (err) {
      console.error('Enrollment failed:', err);
      setError('Failed to enroll in course. Please try again.');
    }
  };
  
  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };
  
  return (
    <main id="main-content" className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Courses</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4">
          <nav aria-label="Course filters">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </nav>
        </aside>

        <section className="lg:w-3/4" aria-labelledby="course-results-heading">
          <h2 id="course-results-heading" className="sr-only">Course Results</h2>

          <SearchBar
            searchTerm={filters.search}
            onSearchChange={(search) => handleFilterChange({ search })}
          />

          {error && (
            <div role="alert" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div role="status" aria-live="polite" aria-label="Loading courses" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse" aria-hidden="true">
                  <div className="h-40 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEnroll={handleEnroll}
                      onClick={() => handleCourseClick(course.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12" role="status">
                    <p className="text-gray-500">No courses found matching your criteria.</p>
                  </div>
                )}
              </div>

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                ariaLabel="Course pagination navigation"
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
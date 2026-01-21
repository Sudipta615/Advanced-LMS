import { useState, useEffect } from 'react';
import { getCourses } from '../api';

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseCoursesResult {
  courses: Course[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  refresh: () => void;
}

export function useCourses(params: any = {}): UseCoursesResult {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCourses(params);
      
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
  }, [JSON.stringify(params)]);
  
  return {
    courses,
    loading,
    error,
    pagination,
    refresh: fetchCourses
  };
}
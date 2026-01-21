import { useState, useEffect } from 'react';
import { getMyEnrollments, enrollCourse, unenrollCourse } from '../api';

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseEnrollmentsResult {
  enrollments: Enrollment[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  enroll: (courseId: string) => Promise<void>;
  unenroll: (enrollmentId: string) => Promise<void>;
  refresh: () => void;
}

export function useEnrollments(params: any = {}): UseEnrollmentsResult {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getMyEnrollments(params);
      
      setEnrollments(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
      setError('Failed to load enrollments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const enroll = async (courseId: string) => {
    try {
      await enrollCourse(courseId);
      await fetchEnrollments();
    } catch (err) {
      console.error('Enrollment failed:', err);
      throw err;
    }
  };
  
  const unenroll = async (enrollmentId: string) => {
    try {
      await unenrollCourse(enrollmentId);
      await fetchEnrollments();
    } catch (err) {
      console.error('Unenrollment failed:', err);
      throw err;
    }
  };
  
  useEffect(() => {
    fetchEnrollments();
  }, [JSON.stringify(params)]);
  
  return {
    enrollments,
    loading,
    error,
    pagination,
    enroll,
    unenroll,
    refresh: fetchEnrollments
  };
}
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Course API methods
export const getCourses = (params: any = {}) => {
  return api.get('/api/courses', { params });
};

export const getCourseById = (id: string) => {
  return api.get(`/api/courses/${id}`);
};

export const createCourse = (data: any) => {
  return api.post('/api/courses', data);
};

export const updateCourse = (id: string, data: any) => {
  return api.put(`/api/courses/${id}`, data);
};

export const deleteCourse = (id: string) => {
  return api.delete(`/api/courses/${id}`);
};

export const getCourseSections = (courseId: string) => {
  return api.get(`/api/courses/${courseId}/sections`);
};

export const createSection = (courseId: string, data: any) => {
  return api.post(`/api/courses/${courseId}/sections`, data);
};

export const updateSection = (courseId: string, sectionId: string, data: any) => {
  return api.put(`/api/courses/${courseId}/sections/${sectionId}`, data);
};

export const deleteSection = (courseId: string, sectionId: string) => {
  return api.delete(`/api/courses/${courseId}/sections/${sectionId}`);
};

export const getLesson = (lessonId: string) => {
  return api.get(`/api/lessons/${lessonId}`);
};

export const createLesson = (courseId: string, sectionId: string, data: any) => {
  return api.post(`/api/courses/${courseId}/sections/${sectionId}/lessons`, data);
};

export const updateLesson = (lessonId: string, data: any) => {
  return api.put(`/api/lessons/${lessonId}`, data);
};

export const deleteLesson = (lessonId: string) => {
  return api.delete(`/api/lessons/${lessonId}`);
};

// Enrollment API methods
export const enrollCourse = (courseId: string) => {
  return api.post('/api/enrollments', { course_id: courseId });
};

export const getMyEnrollments = (params: any = {}) => {
  return api.get('/api/enrollments', { params });
};

export const getEnrollment = (enrollmentId: string) => {
  return api.get(`/api/enrollments/${enrollmentId}`);
};

export const unenrollCourse = (enrollmentId: string) => {
  return api.delete(`/api/enrollments/${enrollmentId}`);
};

export const getCourseProgress = (courseId: string) => {
  return api.get(`/api/courses/${courseId}/progress`);
};

export const getEnrollmentProgress = (enrollmentId: string) => {
  return api.get(`/api/enrollments/${enrollmentId}/progress`);
};

export const completeLesson = (lessonId: string, data: any = {}) => {
  return api.post(`/api/lessons/${lessonId}/complete`, data);
};

export const getCourseAnalytics = (courseId: string) => {
  return api.get(`/api/courses/${courseId}/analytics`);
};

export default api;

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CoursePlayer } from '@/components/learning/CoursePlayer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  lesson_type: string;
  video_url: string | null;
  video_provider: string | null;
  self_hosted_video_path: string | null;
  document_paths: string[];
  external_links: Array<{
    title: string;
    url: string;
  }>;
  markdown_content: string | null;
  display_order: number;
  duration_minutes: number | null;
  is_published: boolean;
  requires_completion: boolean;
  isCompleted: boolean;
  completed_at: string | null;
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  lessons: Lesson[];
}

interface CourseProgress {
  course_id: string;
  course_title: string;
  completion_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  sections: Array<{
    section_id: string;
    title: string;
    completion_percentage: number;
    completed_lessons: number;
    total_lessons: number;
  }>;
}

export default function LearningPage({ params }: { params: { courseId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingLesson, setCompletingLesson] = useState(false);
  
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch enrollment with course content
      const enrollmentResponse = await api.get('/api/enrollments', {
        params: {
          course_id: params.courseId,
          limit: 1
        }
      });
      
      const enrollment = enrollmentResponse.data.data[0];
      
      if (!enrollment) {
        throw new Error('You are not enrolled in this course');
      }
      
      // Fetch course progress
      const progressResponse = await api.get(`/api/courses/${params.courseId}/progress`);
      setProgress(progressResponse.data.data);
      
      // Extract sections and lessons from enrollment
      const courseSections = enrollment.course.sections.map((section: any) => ({
        ...section,
        lessons: section.lessons.map((lesson: any) => ({
          ...lesson,
          isCompleted: lesson.isCompleted || false,
          completed_at: lesson.completed_at || null
        }))
      }));
      
      setSections(courseSections);
      
      // Find first incomplete lesson or first lesson
      let firstLesson = null;
      
      for (const section of courseSections) {
        const incompleteLesson = section.lessons.find(lesson => !lesson.isCompleted);
        if (incompleteLesson) {
          firstLesson = incompleteLesson;
          break;
        }
        
        // If all lessons in section are complete, take the first lesson
        if (section.lessons.length > 0) {
          firstLesson = section.lessons[0];
          break;
        }
      }
      
      if (firstLesson) {
        setCurrentLesson(firstLesson);
      }
      
    } catch (err) {
      console.error('Failed to fetch course data:', err);
      setError(err.response?.data?.message || 'Failed to load course. Please try again later.');
      
      // If not enrolled, redirect to course page
      if (err.response?.status === 403) {
        setTimeout(() => {
          router.push(`/courses/${params.courseId}`);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchCourseData();
  }, [user, params.courseId]);
  
  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };
  
  const handleCompleteLesson = async () => {
    if (!currentLesson || completingLesson) return;
    
    try {
      setCompletingLesson(true);
      
      await api.post(`/api/lessons/${currentLesson.id}/complete`, {
        time_spent_minutes: 0 // You could track actual time spent
      });
      
      // Refresh data
      await fetchCourseData();
      
      // Find next lesson
      if (currentLesson) {
        const currentSection = sections.find(section => 
          section.lessons.some(lesson => lesson.id === currentLesson.id)
        );
        
        if (currentSection) {
          const currentLessonIndex = currentSection.lessons.findIndex(lesson => lesson.id === currentLesson.id);
          
          // Check if there's a next lesson in the same section
          if (currentLessonIndex < currentSection.lessons.length - 1) {
            setCurrentLesson(currentSection.lessons[currentLessonIndex + 1]);
          } else {
            // Find next section
            const currentSectionIndex = sections.findIndex(section => section.id === currentSection.id);
            
            if (currentSectionIndex < sections.length - 1) {
              const nextSection = sections[currentSectionIndex + 1];
              if (nextSection.lessons.length > 0) {
                setCurrentLesson(nextSection.lessons[0]);
              }
            }
          }
        }
      }
      
    } catch (err) {
      console.error('Failed to complete lesson:', err);
      setError(err.response?.data?.message || 'Failed to mark lesson as complete. Please try again.');
    } finally {
      setCompletingLesson(false);
    }
  };
  
  const handleBackToCourse = () => {
    router.push(`/courses/${params.courseId}`);
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
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message={error} />
        <button 
          onClick={handleBackToCourse} 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Course
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={handleBackToCourse} 
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Course
      </button>
      
      {progress && currentLesson && (
        <CoursePlayer 
          courseId={params.courseId} 
          sections={sections} 
          currentLesson={currentLesson} 
          progress={progress} 
          onLessonSelect={handleLessonSelect} 
          onCompleteLesson={handleCompleteLesson} 
          isCompleting={completingLesson} 
        />
      )}
    </div>
  );
}
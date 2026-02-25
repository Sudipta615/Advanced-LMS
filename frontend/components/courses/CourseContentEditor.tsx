"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  lesson_type: string;
  display_order: number;
  is_published: boolean;
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  lessons: Lesson[];
}

interface CourseContentEditorProps {
  courseId: string;
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

export function CourseContentEditor({ courseId, sections, onSectionsChange }: CourseContentEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showNewSectionForm, setShowNewSectionForm] = useState(false);

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(`/api/courses/${courseId}/sections`, {
        title: newSectionTitle,
        description: '',
        display_order: sections.length + 1
      });
      
      onSectionsChange([...sections, response.data.data]);
      setNewSectionTitle('');
      setShowNewSectionForm(false);
      setSuccess('Section created successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to create section:', err);
      setError(err.response?.data?.message || 'Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section and all its lessons?')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/api/courses/${courseId}/sections/${sectionId}`);
      onSectionsChange(sections.filter(s => s.id !== sectionId));
      setSuccess('Section deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to delete section:', err);
      setError(err.response?.data?.message || 'Failed to delete section');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (sectionId: string, lessonData: Partial<Lesson>) => {
    try {
      setLoading(true);
      setError(null);
      
      const section = sections.find(s => s.id === sectionId);
      const response = await api.post(`/api/courses/${courseId}/sections/${sectionId}/lessons`, {
        ...lessonData,
        display_order: section?.lessons.length || 0 + 1
      });
      
      const updatedSections = sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, lessons: [...s.lessons, response.data.data] };
        }
        return s;
      });
      
      onSectionsChange(updatedSections);
      setSuccess('Lesson created successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to create lesson:', err);
      setError(err.response?.data?.message || 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/api/lessons/${lessonId}`);
      
      const updatedSections = sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) };
        }
        return s;
      });
      
      onSectionsChange(updatedSections);
      setSuccess('Lesson deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to delete lesson:', err);
      setError(err.response?.data?.message || 'Failed to delete lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Course Content</h2>
          <button
            onClick={() => setShowNewSectionForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Section
          </button>
        </div>
        
        {showNewSectionForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Section title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateSection}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? <LoadingSpinner /> : 'Create Section'}
              </button>
              <button
                onClick={() => {
                  setShowNewSectionForm(false);
                  setNewSectionTitle('');
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {sections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No sections yet. Add your first section to start building your course.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={section.id} className="border border-gray-200 rounded-lg">
                <div
                  className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">Section {index + 1}:</span>
                    <h3 className="font-medium">{section.title}</h3>
                    <span className="text-sm text-gray-500">({section.lessons.length} lessons)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      className="text-red-600 hover:text-red-700 px-2 py-1"
                    >
                      Delete
                    </button>
                    <span className="text-gray-400">
                      {expandedSection === section.id ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
                
                {expandedSection === section.id && (
                  <div className="p-4">
                    <div className="space-y-2 mb-4">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400">{lessonIndex + 1}.</span>
                            <span>{lesson.title}</span>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                              {lesson.lesson_type}
                            </span>
                            {lesson.is_published && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Published
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/instructor/lessons/${lesson.id}/edit`)}
                              className="text-blue-600 hover:text-blue-700 px-2 py-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(section.id, lesson.id)}
                              className="text-red-600 hover:text-red-700 px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => router.push(`/instructor/courses/${courseId}/sections/${section.id}/lessons/create`)}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                      + Add Lesson
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

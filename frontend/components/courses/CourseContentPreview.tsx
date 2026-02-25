"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Play, Clock, FileText, HelpCircle } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  lesson_type: string;
  duration_minutes: number | null;
  is_published: boolean;
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  lessons: Lesson[];
}

interface CourseContentPreviewProps {
  sections: Section[];
  isEnrolled: boolean;
}

export function CourseContentPreview({ sections, isEnrolled }: CourseContentPreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(sections.slice(0, 2).map(s => s.id)));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      case 'assignment':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const totalLessons = sections.reduce((sum, section) => sum + section.lessons.length, 0);
  const totalDuration = sections.reduce((sum, section) => {
    return sum + section.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.duration_minutes || 0), 0);
  }, 0);

  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Course Content</h2>
        <p className="text-gray-500">No content available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Course Content</h2>
        <div className="text-sm text-gray-600">
          {sections.length} sections • {totalLessons} lessons • {Math.round(totalDuration / 60)}h total
        </div>
      </div>
      
      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div className="text-left">
                  <h3 className="font-medium">{section.title}</h3>
                  <p className="text-sm text-gray-500">
                    {section.lessons.length} lessons
                    {section.lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0) > 0 && (
                      <span> • {Math.round(section.lessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0))} min</span>
                    )}
                  </p>
                </div>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has(section.id) && (
              <div className="divide-y divide-gray-100">
                {section.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {!isEnrolled && !lesson.is_published ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <span className="text-gray-400">
                          {getLessonIcon(lesson.lesson_type)}
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-gray-700">{lesson.title}</p>
                        <p className="text-sm text-gray-500 capitalize">{lesson.lesson_type}</p>
                      </div>
                    </div>
                    {lesson.duration_minutes && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {lesson.duration_minutes} min
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {!isEnrolled && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700 text-sm">
            <Lock className="w-4 h-4 inline mr-1" />
            Enroll in this course to access all lessons and content.
          </p>
        </div>
      )}
    </div>
  );
}

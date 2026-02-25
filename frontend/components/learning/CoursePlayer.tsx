"use client";

import { useState } from 'react';
import { 
  Play, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Clock,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  lesson_type: string;
  video_url: string | null;
  video_provider: string | null;
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

interface CoursePlayerProps {
  courseId: string;
  sections: Section[];
  currentLesson: Lesson;
  progress: CourseProgress;
  onLessonSelect: (lesson: Lesson) => void;
  onCompleteLesson: () => void;
  isCompleting: boolean;
}

export function CoursePlayer({
  courseId,
  sections,
  currentLesson,
  progress,
  onLessonSelect,
  onCompleteLesson,
  isCompleting
}: CoursePlayerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(sections.map(s => s.id)));
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const getCurrentSection = () => {
    return sections.find(section => 
      section.lessons.some(lesson => lesson.id === currentLesson.id)
    );
  };

  const getCurrentLessonIndex = () => {
    const section = getCurrentSection();
    if (!section) return -1;
    return section.lessons.findIndex(lesson => lesson.id === currentLesson.id);
  };

  const getNextLesson = (): Lesson | null => {
    const currentSection = getCurrentSection();
    const currentLessonIndex = getCurrentLessonIndex();
    
    if (!currentSection) return null;
    
    // Check if there's a next lesson in the same section
    if (currentLessonIndex < currentSection.lessons.length - 1) {
      return currentSection.lessons[currentLessonIndex + 1];
    }
    
    // Find next section
    const currentSectionIndex = sections.findIndex(section => section.id === currentSection.id);
    if (currentSectionIndex < sections.length - 1) {
      const nextSection = sections[currentSectionIndex + 1];
      if (nextSection.lessons.length > 0) {
        return nextSection.lessons[0];
      }
    }
    
    return null;
  };

  const getPreviousLesson = (): Lesson | null => {
    const currentSection = getCurrentSection();
    const currentLessonIndex = getCurrentLessonIndex();
    
    if (!currentSection) return null;
    
    // Check if there's a previous lesson in the same section
    if (currentLessonIndex > 0) {
      return currentSection.lessons[currentLessonIndex - 1];
    }
    
    // Find previous section
    const currentSectionIndex = sections.findIndex(section => section.id === currentSection.id);
    if (currentSectionIndex > 0) {
      const prevSection = sections[currentSectionIndex - 1];
      if (prevSection.lessons.length > 0) {
        return prevSection.lessons[prevSection.lessons.length - 1];
      }
    }
    
    return null;
  };

  const renderLessonContent = () => {
    switch (currentLesson.lesson_type) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {currentLesson.video_url ? (
              currentLesson.video_provider === 'youtube' ? (
                <iframe
                  src={currentLesson.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video
                  src={currentLesson.video_url}
                  className="w-full h-full"
                  controls
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <p>No video available</p>
              </div>
            )}
          </div>
        );
      case 'quiz':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Quiz: {currentLesson.title}</h3>
            <p className="text-gray-600 mb-4">
              This quiz will test your understanding of the material covered in this lesson.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Start Quiz
            </button>
          </div>
        );
      case 'assignment':
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Assignment: {currentLesson.title}</h3>
            <p className="text-gray-600 mb-4">
              {currentLesson.description || 'Complete this assignment to demonstrate your understanding.'}
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              View Assignment Details
            </button>
          </div>
        );
      default:
        return (
          <div className="prose max-w-none">
            {currentLesson.content ? (
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
            ) : currentLesson.markdown_content ? (
              <div className="whitespace-pre-wrap">{currentLesson.markdown_content}</div>
            ) : (
              <p className="text-gray-500">No content available for this lesson.</p>
            )}
          </div>
        );
    }
  };

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-12'} flex-shrink-0 transition-all duration-300`}>
        <div className="bg-white rounded-lg shadow-md h-full overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            {sidebarOpen && (
              <div>
                <h2 className="font-semibold">Course Content</h2>
                <div className="text-sm text-gray-600">
                  {progress.completed_lessons} of {progress.total_lessons} completed
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {sidebarOpen ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
          
          {sidebarOpen && (
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="p-2">
                <ProgressBar percentage={progress.completion_percentage} />
              </div>
              
              <div className="divide-y divide-gray-100">
                {sections.map((section, sectionIndex) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                          {sectionIndex + 1}
                        </span>
                        <span className="font-medium text-sm">{section.title}</span>
                      </div>
                      {expandedSections.has(section.id) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedSections.has(section.id) && (
                      <div className="bg-gray-50">
                        {section.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => onLessonSelect(lesson)}
                            className={`w-full flex items-center gap-3 p-3 pl-10 text-sm hover:bg-gray-100 ${
                              currentLesson.id === lesson.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''
                            }`}
                          >
                            {lesson.isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <span className="text-gray-400">
                                {getLessonIcon(lesson.lesson_type)}
                              </span>
                            )}
                            <span className={`flex-1 text-left ${lesson.isCompleted ? 'text-gray-500' : ''}`}>
                              {lesson.title}
                            </span>
                            {lesson.duration_minutes && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.duration_minutes}m
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>{progress.course_title}</span>
            <span>/</span>
            <span>{getCurrentSection()?.title}</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-6">{currentLesson.title}</h1>
          
          {renderLessonContent()}
        </div>
        
        {/* Navigation and Completion */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {previousLesson && (
              <button
                onClick={() => onLessonSelect(previousLesson)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            {!currentLesson.isCompleted && (
              <button
                onClick={onCompleteLesson}
                disabled={isCompleting}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {isCompleting ? 'Completing...' : 'Mark as Complete'}
              </button>
            )}
            
            {nextLesson && (
              <button
                onClick={() => onLessonSelect(nextLesson)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* External Links and Documents */}
        {(currentLesson.external_links?.length > 0 || currentLesson.document_paths?.length > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="font-semibold mb-4">Resources</h3>
            
            {currentLesson.document_paths?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Documents</h4>
                <ul className="space-y-2">
                  {currentLesson.document_paths.map((doc, index) => (
                    <li key={index}>
                      <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {doc.split('/').pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {currentLesson.external_links?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">External Links</h4>
                <ul className="space-y-2">
                  {currentLesson.external_links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

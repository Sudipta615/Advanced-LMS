"use client";

import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Course {
  id?: string;
  title: string;
  slug?: string;
  description: string;
  content?: string | null | undefined;
  thumbnail_url?: string | null | undefined;
  category_id: string;
  difficulty_level: string;
  estimated_hours: number;
  price: number;
  language: string;
  status?: string;
  visibility?: string;
  is_featured?: boolean;
  tags?: string[];
  prerequisites?: string[];
  required_score?: number;
  allow_retake?: boolean;
  max_attempts?: number | null;
}

interface CourseFormProps {
  course?: Course | null;
  categories: Category[];
  onSubmit: (formData: Omit<Course, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CourseForm({ course, categories, onSubmit, onCancel, isLoading }: CourseFormProps) {
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    title: course?.title || '',
    description: course?.description || '',
    content: course?.content || '',
    thumbnail_url: course?.thumbnail_url || '',
    category_id: course?.category_id || '',
    difficulty_level: course?.difficulty_level || 'beginner',
    estimated_hours: course?.estimated_hours || 0,
    price: course?.price || 0,
    language: course?.language || 'English',
    visibility: course?.visibility || 'public',
    is_featured: course?.is_featured || false,
    tags: course?.tags || [],
    allow_retake: course?.allow_retake ?? true,
    max_attempts: course?.max_attempts || null,
  });
  
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }
    
    setError(null);
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Course Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              id="difficulty_level"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              id="estimated_hours"
              name="estimated_hours"
              value={formData.estimated_hours}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <input
              type="text"
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
              Featured Course
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allow_retake"
              name="allow_retake"
              checked={formData.allow_retake}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="allow_retake" className="ml-2 text-sm text-gray-700">
              Allow Retake
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Media</h2>
        
        <div>
          <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-1">
            Thumbnail URL
          </label>
          <input
            type="url"
            id="thumbnail_url"
            name="thumbnail_url"
            value={formData.thumbnail_url || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Saving...
            </>
          ) : (
            course ? 'Update Course' : 'Create Course'
          )}
        </button>
      </div>
    </form>
  );
}

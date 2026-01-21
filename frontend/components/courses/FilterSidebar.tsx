import React from 'react';

interface FilterSidebarProps {
  filters: {
    category: string;
    difficulty: string;
    tags: string;
    sort: string;
  };
  onFilterChange: (filters: Partial<FilterSidebarProps['filters']>) => void;
}

export function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'business', label: 'Business' },
    { value: 'technology', label: 'Technology' },
    { value: 'design', label: 'Design' },
    { value: 'development', label: 'Development' },
    { value: 'marketing', label: 'Marketing' }
  ];
  
  const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];
  
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">Filters</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select 
            value={filters.category} 
            onChange={(e) => onFilterChange({ category: e.target.value })} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
          <select 
            value={filters.difficulty} 
            onChange={(e) => onFilterChange({ difficulty: e.target.value })} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select 
            value={filters.sort} 
            onChange={(e) => onFilterChange({ sort: e.target.value })} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={() => onFilterChange({
            category: '',
            difficulty: '',
            tags: '',
            sort: 'newest'
          })} 
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
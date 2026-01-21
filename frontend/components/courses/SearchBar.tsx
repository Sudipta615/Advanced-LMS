import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

export function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search courses by title or tags..." 
          value={searchTerm} 
          onChange={(e) => onSearchChange(e.target.value)} 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button 
          type="submit" 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
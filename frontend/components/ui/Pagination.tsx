import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, ariaLabel = 'Pagination navigation' }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Show pages around current page
      let startPage = Math.max(2, currentPage - Math.floor((maxVisiblePages - 2) / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

      if (currentPage <= Math.floor((maxVisiblePages - 2) / 2) + 1) {
        endPage = maxVisiblePages - 1;
      }

      if (currentPage >= totalPages - Math.floor((maxVisiblePages - 2) / 2)) {
        startPage = totalPages - (maxVisiblePages - 2);
      }

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      className="flex justify-center items-center gap-2"
      aria-label={ariaLabel}
      role="navigation"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
        aria-label="Go to previous page"
        aria-disabled={currentPage === 1}
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={typeof page === 'number' ? page : index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={typeof page !== 'number'}
          className={`px-3 py-2 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} ${typeof page !== 'number' ? 'cursor-default' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
          aria-label={typeof page === 'number' ? `Go to page ${page}` : 'More pages'}
          aria-current={typeof page === 'number' && currentPage === page ? 'page' : undefined}
          aria-disabled={typeof page !== 'number'}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
        aria-label="Go to next page"
        aria-disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
}
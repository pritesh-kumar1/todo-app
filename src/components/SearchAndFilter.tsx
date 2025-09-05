'use client';

import { useState, useEffect, useDeferredValue, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchTodosAction, getTodosByCategoryAction } from '@/lib/actions';
import type { Todo, Category } from '@/lib/database';

interface SearchAndFilterProps {
  categories: Category[];
  onResultsChange: (todos: Todo[]) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function SearchAndFilter({ 
  categories, 
  onResultsChange, 
  selectedCategory, 
  onCategoryChange 
}: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  
  // React 19: useDeferredValue for better performance during typing
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    // React 19: Enhanced concurrent features with startTransition
    startTransition(async () => {
      try {
        let results: Todo[];
        
        if (deferredSearchQuery.trim()) {
          // Search across all todos when there's a query
          results = await searchTodosAction(deferredSearchQuery);
        } else {
          // Filter by category when no search query
          results = await getTodosByCategoryAction(selectedCategory);
        }
        
        onResultsChange(results);
      } catch (error) {
        console.error('Search/filter error:', error);
        onResultsChange([]);
      }
    });
  }, [deferredSearchQuery, selectedCategory]); // Removed onResultsChange from dependencies

  const handleCategorySelect = (category: string) => {
    setSearchQuery(''); // Clear search when selecting category
    onCategoryChange(category);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search todos..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {isPending ? (
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="text-gray-400">🔍</span>
            )}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Filter by category:</p>
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => handleCategorySelect('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-gray-800 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All ({categories.reduce((sum, cat) => sum + cat.count, 0)})
            </motion.button>
            
            <AnimatePresence>
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleCategorySelect(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.name
                      ? 'text-white shadow-lg'
                      : 'text-gray-700 hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.name 
                      ? category.color 
                      : `${category.color}20`,
                    borderColor: category.color,
                    borderWidth: selectedCategory === category.name ? '0' : '1px',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)} ({category.count})
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Search Status */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 rounded-lg p-3"
            >
              <p className="text-blue-700 text-sm">
                {isPending ? (
                  <>Searching for "{deferredSearchQuery}"...</>
                ) : (
                  <>Showing results for "{deferredSearchQuery}"</>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

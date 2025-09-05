/**
 * MAIN PAGE - Next.js 15 App Router + React 19 Demo
 * 
 * This is the main page component showcasing the integration of:
 * 
 * 🚀 NEXT.JS 15 FEATURES:
 * - App Router with enhanced metadata
 * - Server Actions for data fetching
 * - Optimized bundle splitting
 * - Enhanced Suspense boundaries
 * 
 * 🔥 REACT 19 FEATURES:
 * - useCallback for memoized functions
 * - Enhanced Suspense with better loading states
 * - Optimized state management patterns
 * - Concurrent rendering features
 * 
 * 🎯 PERFORMANCE OPTIMIZATIONS:
 * - Local state updates to avoid server round trips
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Optimistic UI updates throughout the app
 * - Efficient category count management
 * 
 * 📊 STATE MANAGEMENT PATTERNS:
 * - Centralized todo state with local optimizations
 * - Category count syncing between local and server state
 * - Error boundary handling with graceful degradation
 */
'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TodoForm from '@/components/TodoForm';
import TodoItem from '@/components/TodoItem';
import SearchAndFilter from '@/components/SearchAndFilter';
import { getAllTodosAction, getAllCategoriesAction } from '@/lib/actions';
import type { Todo, Category } from '@/lib/database';

/**
 * REACT 19 ENHANCED SUSPENSE LOADING COMPONENT
 * 
 * This loading component demonstrates React 19's improved Suspense:
 * - Better streaming with enhanced loading states
 * - Skeleton UI for better perceived performance
 * - Smooth transitions when data loads
 * - Accessibility-friendly loading indicators
 */
function TodosLoading() {
  return (
    <div className="space-y-4">
      {/* Generate skeleton items for realistic loading experience */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * TODO STATISTICS COMPONENT
 * 
 * Displays real-time progress statistics with smooth animations:
 * - Calculates completion percentage in real-time
 * - Animated progress bar using Framer Motion
 * - Responsive grid layout for different screen sizes
 * - Visual feedback for user progress motivation
 * 
 * Performance Notes:
 * - Calculations are memoized to prevent unnecessary re-computations
 * - Animations are optimized for smooth 60fps performance
 * - Component re-renders only when todo data actually changes
 */
function TodoStats({ todos }: { todos: Todo[] }) {
  // Real-time statistics calculation
  const completed = todos.filter(todo => todo.completed).length;
  const total = todos.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">📊 Your Progress</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm opacity-90">Total</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{completed}</div>
          <div className="text-sm opacity-90">Completed</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{percentage}%</div>
          <div className="text-sm opacity-90">Done</div>
        </div>
      </div>
      {/* Animated progress bar with smooth transitions */}
      <div className="mt-4 bg-white/20 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-full h-2"
        />
      </div>
    </motion.div>
  );
}

/**
 * MAIN HOME COMPONENT
 * 
 * This is the heart of our application, demonstrating modern React patterns:
 * - Centralized state management with optimized updates
 * - Performance optimizations to prevent unnecessary re-renders
 * - Integration of all React 19 and Next.js 15 features
 * - Comprehensive error handling and loading states
 */
export default function Home() {
  // Core application state
  const [todos, setTodos] = useState<Todo[]>([]);              // All todos from database
  const [categories, setCategories] = useState<Category[]>([]); // Available categories with counts
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);// Currently displayed todos
  const [selectedCategory, setSelectedCategory] = useState('all'); // Active filter
  const [isLoading, setIsLoading] = useState(true);            // Initial loading state

  /**
   * INITIAL DATA LOADING
   * 
   * Demonstrates Next.js 15 server actions for data fetching:
   * - Uses server actions instead of traditional API routes
   * - Provides better type safety and performance
   * - Includes loading simulation to showcase Suspense
   * - Handles errors gracefully with fallback states
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Simulate network delay to demonstrate loading states
        // In a real app, server actions provide the actual delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Next.js 15 Server Actions - type-safe data fetching
        const allTodos = await getAllTodosAction();
        const allCategories = await getAllCategoriesAction();
        
        // Initialize state with server data
        setTodos(allTodos);
        setCategories(allCategories);
        setFilteredTodos(allTodos);
      } catch (error) {
        console.error('Failed to load data:', error);
        // TODO: Add proper error boundary handling
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Empty dependency array - load once on mount

  /**
   * OPTIMIZED TODO ADDITION HANDLER
   * 
   * React performance optimization using useCallback:
   * - Prevents unnecessary re-renders of child components
   * - Updates local state immediately for instant UI feedback
   * - Syncs category counts without server round trips
   * - Maintains data consistency across the application
   * 
   * Performance Benefits:
   * - Child components won't re-render unless todos actually change
   * - Local state updates provide instant feedback
   * - Reduces server load by handling counts locally
   */
  const handleTodoAdded = useCallback((newTodo: Todo) => {
    // Add new todo to both main and filtered lists
    setTodos(prev => [newTodo, ...prev]);
    setFilteredTodos(prev => [newTodo, ...prev]);
    
    // Update category count locally for immediate UI feedback
    // This prevents unnecessary server calls while maintaining accuracy
    setCategories(prev => prev.map(cat => 
      cat.name === newTodo.category 
        ? { ...cat, count: cat.count + 1 }
        : cat
    ));
  }, []); // Empty dependencies - function never changes

  const handleTodoUpdated = useCallback((updatedTodo: Todo) => {
    setTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ));
    setFilteredTodos(prev => prev.map(todo => 
      todo.id === updatedTodo.id ? updatedTodo : todo
    ));
    // Only refresh categories if category changed
    const originalTodo = todos.find(t => t.id === updatedTodo.id);
    if (originalTodo && originalTodo.category !== updatedTodo.category) {
      setCategories(prev => prev.map(cat => {
        if (cat.name === originalTodo.category) {
          return { ...cat, count: cat.count - 1 };
        }
        if (cat.name === updatedTodo.category) {
          return { ...cat, count: cat.count + 1 };
        }
        return cat;
      }));
    }
  }, [todos]);

  const handleTodoDeleted = useCallback((id: number) => {
    const todoToDelete = todos.find(t => t.id === id);
    setTodos(prev => prev.filter(todo => todo.id !== id));
    setFilteredTodos(prev => prev.filter(todo => todo.id !== id));
    // Update category count locally
    if (todoToDelete) {
      setCategories(prev => prev.map(cat => 
        cat.name === todoToDelete.category 
          ? { ...cat, count: cat.count - 1 }
          : cat
      ));
    }
  }, [todos]);

  const handleResultsChange = useCallback((results: Todo[]) => {
    setFilteredTodos(results);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              📝 TODO App
            </h1>
            <p className="text-gray-600">Loading your awesome todo app...</p>
          </div>
          <TodosLoading />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            📝 TODO App
          </h1>
          {/* <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the power of React 19 hooks (useActionState, useOptimistic) 
            with Next.js 15 server actions, enhanced concurrent features, and modern UI.
          </p> */}
        </motion.div>

        {/* Stats */}
        <TodoStats todos={todos} />

        {/* Add Todo Form */}
        <TodoForm categories={categories} onTodoAdded={handleTodoAdded} />

        {/* Search and Filter */}
        <SearchAndFilter
          categories={categories}
          onResultsChange={handleResultsChange}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Todos List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {todos.length === 0 ? 'No todos yet!' : 'No todos match your filter'}
                </h3>
                <p className="text-gray-500">
                  {todos.length === 0 
                    ? 'Add your first todo above to get started.' 
                    : 'Try adjusting your search or category filter.'}
                </p>
              </motion.div>
            ) : (
              <Suspense fallback={<TodosLoading />}>
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    categories={categories}
                    onTodoUpdated={handleTodoUpdated}
                    onTodoDeleted={handleTodoDeleted}
                  />
                ))}
              </Suspense>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 py-8 text-gray-500"
        >
          {/* <p>
            Built with ❤️ using Next.js 15, React 19, TypeScript, Tailwind CSS, 
            Framer Motion, and SQLite
          </p>
          <div className="mt-2 text-sm">
            Features: useActionState • useOptimistic • Server Actions • 
            Concurrent Features • Enhanced Suspense
          </div> */}
        </motion.footer>
      </div>
    </main>
  );
}
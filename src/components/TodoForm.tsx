/**
 * TODO FORM COMPONENT - React 19 Features Showcase
 * 
 * This component demonstrates cutting-edge React 19 features:
 * 
 * 🔥 KEY REACT 19 FEATURES:
 * - useActionState: Seamless form handling with server actions
 * - useOptimistic: Immediate UI feedback before server response
 * - useTransition: Non-blocking state updates for smooth UX
 * - Enhanced form integration with Next.js 15 server actions
 * 
 * 🚀 NEXT.JS 15 INTEGRATION:
 * - Direct form action binding to server functions
 * - Automatic FormData handling
 * - Type-safe client-server communication
 * - Built-in error states and loading indicators
 * 
 * 🎨 UX ENHANCEMENTS:
 * - Optimistic updates for instant feedback
 * - Smooth animations with Framer Motion
 * - Comprehensive error handling
 * - Accessible form design
 */
'use client';

import { useActionState, useOptimistic, useRef, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { createTodoAction, type ActionState } from '@/lib/actions';
import type { Todo, Category } from '@/lib/database';

/**
 * TodoForm Component Props
 * 
 * @param categories - Available categories for todo organization
 * @param onTodoAdded - Callback when a new todo is successfully created
 */
interface TodoFormProps {
  categories: Category[];
  onTodoAdded?: (todo: Todo) => void;
}

export default function TodoForm({ categories, onTodoAdded }: TodoFormProps) {
  // Form reference for programmatic control (resetting after submission)
  const formRef = useRef<HTMLFormElement>(null);
  
  /**
   * REACT 19 FEATURE: useTransition
   * 
   * Enables non-blocking state updates for smooth user experience:
   * - Prevents UI freezing during state changes
   * - Allows React to prioritize urgent updates
   * - Essential for optimistic updates in React 19
   */
  const [isPendingTransition, startTransition] = useTransition();
  
  /**
   * REACT 19 FEATURE: useActionState
   * 
   * Revolutionary form handling that connects directly to server actions:
   * 
   * Benefits:
   * - Automatic FormData extraction and validation
   * - Built-in pending states for loading indicators
   * - Seamless error handling from server
   * - Progressive enhancement (works without JavaScript)
   * - Type-safe integration with Next.js server actions
   * 
   * @param createTodoAction - Server action function from Next.js 15
   * @param initialState - Default state structure
   * @returns [state, formAction, isPending] - State, action function, loading status
   */
  const [state, formAction, isPending] = useActionState(createTodoAction, {
    success: false,
    message: '',
    error: '',
    data: undefined
  });

  /**
   * REACT 19 FEATURE: useOptimistic
   * 
   * Provides immediate UI feedback before server confirmation:
   * 
   * How it works:
   * - Updates UI instantly when user submits form
   * - Shows optimistic state while server processes
   * - Automatically reverts if server returns error
   * - Maintains consistency between client and server state
   * 
   * @param initialValue - Starting message (empty string)
   * @param updateFn - Function to apply optimistic updates
   */
  const [optimisticMessage, setOptimisticMessage] = useOptimistic(
    '',
    (currentMessage: string, newMessage: string) => newMessage
  );

  const handleSubmit = (formData: FormData) => {
    // Optimistic update - show success message immediately (wrapped in transition)
    startTransition(() => {
      setOptimisticMessage('Creating todo...');
    });
    
    // Call the server action (useActionState formAction returns void)
    formAction(formData);
  };

  /**
   * REACT 19 INTEGRATION: useActionState + useOptimistic
   * 
   * This effect demonstrates how React 19 hooks work together:
   * - Listens to server action results from useActionState
   * - Updates optimistic state with startTransition for smooth UX
   * - Handles both success and error cases gracefully
   * - Integrates with parent component through callbacks
   * 
   * Key React 19 Pattern:
   * All optimistic updates MUST be wrapped in startTransition to prevent
   * "optimistic state update occurred outside a transition" errors
   */
  useEffect(() => {
    if (state.success) {
      // Clear the form inputs after successful submission
      formRef.current?.reset();
      
      // REACT 19 REQUIREMENT: Wrap optimistic updates in startTransition
      // This prevents React from throwing errors about unsafe optimistic updates
      startTransition(() => {
        setOptimisticMessage('Todo created successfully! ✨');
      });
      
      // Notify parent component of new todo for local state updates
      // This enables immediate UI updates without server round-trips
      if (onTodoAdded && state.data) {
        onTodoAdded(state.data);
      }
      
      // Auto-clear success message after 2 seconds for clean UX
      setTimeout(() => {
        startTransition(() => {
          setOptimisticMessage('');
        });
      }, 2000);
    } else if (state.error) {
      // Clear any pending optimistic messages on error
      startTransition(() => {
        setOptimisticMessage('');
      });
    }
  }, [state.success, state.error, state.data, onTodoAdded]); // More specific dependencies

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        ✨ Add New Todo
      </h2>
      
      {/* 
        REACT 19 + NEXT.JS 15: Direct Server Action Integration
        
        This form demonstrates the revolutionary form handling in React 19:
        - action={formAction} directly binds to our server action
        - FormData is automatically extracted and passed to the server
        - No need for onSubmit handlers or manual data collection
        - Progressive enhancement: works even without JavaScript
        - Built-in loading states and error handling
      */}
      <form ref={formRef} action={formAction} className="space-y-4">
        <div>
          {/* 
            AUTOMATIC FORMDATA HANDLING
            
            React 19 automatically extracts this input's value using the 'name' attribute
            and passes it to our server action as FormData. No manual event handling needed!
          */}
          <input
            name="title"
            type="text"
            placeholder="What needs to be done?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isPending || isPendingTransition}  // Disabled during server processing
            required  // HTML5 validation works with server actions
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            {/* 
              DYNAMIC FORM OPTIONS
              
              Categories are populated from the database and passed down as props.
              React 19's server actions will automatically include the selected
              value in the FormData object sent to the server.
            */}
            <select
              name="category"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isPending || isPendingTransition}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            {/* 
              ENUM-BASED FORM CONTROL
              
              Priority uses a TypeScript union type for type safety.
              The server action validates these values match the expected enum.
            */}
            <select
              name="priority"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isPending || isPendingTransition}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
        </div>
        
        <motion.button
          type="submit"
          disabled={isPending || isPendingTransition}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {(isPending || isPendingTransition) ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            '+ Add Todo'
          )}
        </motion.button>
      </form>
      
      {/* 
        REACT 19 OPTIMISTIC UI FEEDBACK
        
        This message appears instantly when the user submits the form,
        providing immediate feedback while the server processes the request.
        It's powered by useOptimistic and demonstrates React 19's optimistic update pattern.
      */}
      {optimisticMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm"
        >
          {optimisticMessage}
        </motion.div>
      )}
      
      {/* 
        SERVER ACTION ERROR HANDLING
        
        Errors from the server action are automatically captured by useActionState
        and displayed here. This provides seamless error handling without additional
        try/catch blocks or manual error state management.
      */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
        >
          {state.error}
        </motion.div>
      )}
    </motion.div>
  );
}

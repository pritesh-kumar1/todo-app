'use client';

import { useState, useOptimistic, useActionState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { toggleTodoAction, deleteTodoAction, updateTodoAction, type ActionState } from '@/lib/actions';
import type { Todo, Category } from '@/lib/database';

interface TodoItemProps {
  todo: Todo;
  categories: Category[];
  onTodoUpdated?: (todo: Todo) => void;
  onTodoDeleted?: (id: number) => void;
}

export default function TodoItem({ todo, categories, onTodoUpdated, onTodoDeleted }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPendingTransition, startTransition] = useTransition();
  
  // React 19: useOptimistic for immediate UI updates
  const [optimisticTodo, setOptimisticTodo] = useOptimistic(
    todo,
    (currentTodo: Todo, action: { type: 'toggle' | 'update' | 'delete'; data?: Partial<Todo> }) => {
      switch (action.type) {
        case 'toggle':
          return { ...currentTodo, completed: !currentTodo.completed };
        case 'update':
          return { ...currentTodo, ...action.data };
        case 'delete':
          return currentTodo; // Will be handled by parent component
        default:
          return currentTodo;
      }
    }
  );

  // React 19: useActionState for update form
  const [updateState, updateFormAction, isUpdatePending] = useActionState(
    updateTodoAction.bind(null, todo.id),
    { success: false, message: '', error: '', data: undefined }
  );

  const handleToggle = async () => {
    // Optimistic update wrapped in transition
    startTransition(() => {
      setOptimisticTodo({ type: 'toggle' });
    });
    
    try {
      const result = await toggleTodoAction(optimisticTodo.id);
      if (result.success && result.data && onTodoUpdated) {
        onTodoUpdated(result.data);
      }
    } catch (error) {
      // Revert optimistic update on error
      startTransition(() => {
        setOptimisticTodo({ type: 'toggle' });
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this todo?')) return;
    
    try {
      const result = await deleteTodoAction(optimisticTodo.id);
      if (result.success && onTodoDeleted) {
        onTodoDeleted(optimisticTodo.id);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6366f1';
  };

  // Handle update state changes from useActionState
  useEffect(() => {
    if (updateState.success) {
      setIsEditing(false);
      if (updateState.data && onTodoUpdated) {
        onTodoUpdated(updateState.data);
      }
    }
  }, [updateState.success, updateState.data, onTodoUpdated]); // More specific dependencies

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={clsx(
        'bg-white rounded-lg shadow-md p-4 border-l-4 transition-all duration-200',
        optimisticTodo.completed ? 'opacity-75 bg-gray-50' : ''
      )}
      style={{ borderLeftColor: getCategoryColor(optimisticTodo.category) }}
    >
      {isEditing ? (
        <form action={updateFormAction} className="space-y-3">
          <input
            name="title"
            defaultValue={optimisticTodo.title}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isUpdatePending}
            required
          />
          
          <div className="grid grid-cols-2 gap-3">
            <select
              name="category"
              defaultValue={optimisticTodo.category}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isUpdatePending}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              name="priority"
              defaultValue={optimisticTodo.priority}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isUpdatePending}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isUpdatePending}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {isUpdatePending ? '...' : '✓'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {updateState.error && (
            <p className="text-red-500 text-sm">{updateState.error}</p>
          )}
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleToggle}
            className={clsx(
              'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
              optimisticTodo.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {optimisticTodo.completed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs"
              >
                ✓
              </motion.span>
            )}
          </motion.button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">{getPriorityIcon(optimisticTodo.priority)}</span>
              <span
                className="text-xs px-2 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: getCategoryColor(optimisticTodo.category) }}
              >
                {optimisticTodo.category}
              </span>
            </div>
            <p
              className={clsx(
                'text-gray-800 transition-all duration-200',
                optimisticTodo.completed && 'line-through text-gray-500'
              )}
            >
              {optimisticTodo.title}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(optimisticTodo.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              onClick={() => setIsEditing(true)}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✏️
            </motion.button>
            <motion.button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              🗑️
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

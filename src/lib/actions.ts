/**
 * SERVER ACTIONS - Next.js 15 Feature
 * 
 * The 'use server' directive marks this file as containing server actions.
 * Server actions in Next.js 15 provide:
 * - Type-safe client-server communication
 * - Automatic form handling with React 19's useActionState
 * - Built-in error handling and loading states
 * - Seamless integration with React Server Components
 */
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { todoQueries, type Todo } from './database';

/**
 * ActionState Type Definition
 * 
 * This type defines the structure returned by all server actions.
 * It's designed to work seamlessly with React 19's useActionState hook.
 * 
 * @property success - Indicates if the action completed successfully
 * @property message - Success message to display to user
 * @property error - Error message if action failed
 * @property data - Any data returned from the action (e.g., created todo)
 */
export type ActionState = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: any;
};

/**
 * CREATE TODO SERVER ACTION
 * 
 * This server action demonstrates Next.js 15 server actions with React 19 integration:
 * 
 * Key Features:
 * - Works directly with React 19's useActionState hook
 * - Receives FormData automatically from form submissions
 * - Provides server-side validation and error handling
 * - Uses revalidatePath for automatic UI updates
 * - Type-safe with ActionState return type
 * 
 * @param prevState - Previous state from useActionState (for progressive enhancement)
 * @param formData - Form data automatically passed by React 19
 * @returns ActionState object with success/error information
 */
export async function createTodoAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // Extract form data using FormData API
    // This data comes directly from the form submission
    const title = formData.get('title') as string;
    const category = formData.get('category') as string || 'general';
    const priority = formData.get('priority') as ('low' | 'medium' | 'high') || 'medium';

    // Server-side validation
    // This runs on the server, ensuring data integrity
    if (!title || title.trim().length === 0) {
      return {
        success: false,
        error: 'Todo title is required'
      };
    }

    if (title.trim().length > 200) {
      return {
        success: false,
        error: 'Todo title must be less than 200 characters'
      };
    }

    // Create the todo in the database
    // Uses our SQLite database with proper type handling
    const newTodo = todoQueries.create({
      title: title.trim(),
      completed: false,
      category,
      priority
    });

    // Next.js 15 Feature: Automatic revalidation
    // This tells Next.js to refresh the cache for the home page
    // ensuring the UI updates with the new todo
    revalidatePath('/');
    
    // Return success state for React 19's useActionState
    return {
      success: true,
      message: 'Todo created successfully!',
      data: newTodo  // The new todo data for optimistic updates
    };
  } catch (error) {
    // Comprehensive error handling
    console.error('Create todo error:', error);
    return {
      success: false,
      error: 'Failed to create todo. Please try again.'
    };
  }
}

/**
 * TOGGLE TODO COMPLETION SERVER ACTION
 * 
 * This action demonstrates optimistic updates with server validation:
 * - Called from TodoItem component with useOptimistic
 * - Provides immediate UI feedback while server processes
 * - Automatically syncs with database state
 * 
 * @param id - The ID of the todo to toggle
 * @returns ActionState with updated todo data
 */
export async function toggleTodoAction(id: number): Promise<ActionState> {
  try {
    // Find the todo to toggle
    const todos = todoQueries.getAll();
    const todo = todos.find(t => t.id === id);
    
    // Validate todo exists
    if (!todo) {
      return {
        success: false,
        error: 'Todo not found'
      };
    }

    // Update the completion status in database
    // SQLite handles boolean to integer conversion automatically
    const updatedTodo = todoQueries.update(id, {
      completed: !todo.completed
    });

    // Revalidate the page cache to reflect changes
    revalidatePath('/');
    
    return {
      success: true,
      message: `Todo ${updatedTodo.completed ? 'completed' : 'reopened'}!`,
      data: updatedTodo  // Return updated todo for state synchronization
    };
  } catch (error) {
    console.error('Toggle todo error:', error);
    return {
      success: false,
      error: 'Failed to update todo. Please try again.'
    };
  }
}

export async function deleteTodoAction(id: number): Promise<ActionState> {
  try {
    todoQueries.delete(id);
    revalidatePath('/');
    
    return {
      success: true,
      message: 'Todo deleted successfully!'
    };
  } catch (error) {
    console.error('Delete todo error:', error);
    return {
      success: false,
      error: 'Failed to delete todo. Please try again.'
    };
  }
}

export async function updateTodoAction(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as ('low' | 'medium' | 'high');

    if (!title || title.trim().length === 0) {
      return {
        success: false,
        error: 'Todo title is required'
      };
    }

    if (title.trim().length > 200) {
      return {
        success: false,
        error: 'Todo title must be less than 200 characters'
      };
    }

    const updatedTodo = todoQueries.update(id, {
      title: title.trim(),
      category,
      priority
    });

    revalidatePath('/');
    
    return {
      success: true,
      message: 'Todo updated successfully!',
      data: updatedTodo
    };
  } catch (error) {
    console.error('Update todo error:', error);
    return {
      success: false,
      error: 'Failed to update todo. Please try again.'
    };
  }
}

/**
 * SEARCH TODOS SERVER ACTION
 * 
 * Used with React 19's concurrent features for real-time search:
 * - Called with useDeferredValue for smooth typing experience
 * - Wrapped in startTransition for non-blocking updates
 * - Provides instant search results without page reload
 * 
 * @param query - Search string to filter todos
 * @returns Array of matching todos
 */
export async function searchTodosAction(query: string) {
  try {
    // Return all todos if no search query
    if (!query || query.trim().length === 0) {
      return todoQueries.getAll();
    }
    
    // Use database search with LIKE query for partial matches
    return todoQueries.search(query.trim());
  } catch (error) {
    console.error('Search todos error:', error);
    return [];  // Return empty array on error for graceful degradation
  }
}

/**
 * GET TODOS BY CATEGORY SERVER ACTION
 * 
 * Filters todos by category with optimized database queries:
 * - Used by SearchAndFilter component
 * - Provides real-time category filtering
 * - Handles 'all' category as special case
 * 
 * @param category - Category name to filter by ('all' returns everything)
 * @returns Array of todos in the specified category
 */
export async function getTodosByCategoryAction(category: string) {
  try {
    if (category === 'all') {
      return todoQueries.getAll();
    }
    return todoQueries.getByCategory(category);
  } catch (error) {
    console.error('Get todos by category error:', error);
    return [];
  }
}

/**
 * GET ALL TODOS SERVER ACTION
 * 
 * Simple action to fetch all todos from database:
 * - Used for initial page load
 * - Provides clean separation of data fetching logic
 * - Handles errors gracefully
 * 
 * @returns Array of all todos
 */
export async function getAllTodosAction() {
  try {
    return todoQueries.getAll();
  } catch (error) {
    console.error('Get all todos error:', error);
    return [];
  }
}

/**
 * GET ALL CATEGORIES SERVER ACTION
 * 
 * Fetches categories with todo counts for UI display:
 * - Used for category filter buttons
 * - Includes count of todos in each category
 * - Provides data for category management
 * 
 * @returns Array of categories with counts
 */
export async function getAllCategoriesAction() {
  try {
    return todoQueries.getCategories();
  } catch (error) {
    console.error('Get categories error:', error);
    return [];
  }
}

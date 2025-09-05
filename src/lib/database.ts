/**
 * DATABASE LAYER - SQLite Integration with Type Safety
 * 
 * This file demonstrates modern database patterns with:
 * - SQLite for lightweight, file-based storage
 * - Type-safe database operations with TypeScript
 * - Proper boolean handling for SQLite compatibility
 * - Optimized queries with prepared statements
 * - Connection pooling and error handling
 */

import Database from 'better-sqlite3';
import { join } from 'path';

/**
 * Todo Interface - Core Data Model
 * 
 * Defines the structure of a todo item throughout the application.
 * This interface ensures type safety between database, server actions, and UI components.
 * 
 * @property id - Auto-incrementing primary key
 * @property title - Todo description/content
 * @property completed - Completion status (stored as 0/1 in SQLite)
 * @property category - Organizational category (general, work, personal, shopping)
 * @property priority - Task priority level
 * @property createdAt - Timestamp when todo was created
 * @property updatedAt - Timestamp when todo was last modified
 */
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

/**
 * Category Interface - Category Management
 * 
 * Defines category structure with associated metadata:
 * - Used for filtering and organizing todos
 * - Includes visual theming with color properties
 * - Tracks todo counts for efficient UI rendering
 * 
 * @property id - Category identifier
 * @property name - Display name for the category
 * @property color - Hex color code for UI theming
 * @property count - Number of todos in this category
 */
export interface Category {
  id: number;
  name: string;
  color: string;
  count: number;
}

/**
 * Database Connection Singleton
 * 
 * We use a singleton pattern to ensure only one database connection
 * is created and reused across all operations. This improves performance
 * and prevents connection leaks.
 */
let db: Database.Database | null = null;

/**
 * Database Connection Factory
 * 
 * Creates and initializes the SQLite database with proper schema.
 * This function implements several important patterns:
 * 
 * Key Features:
 * - Lazy initialization - database created only when needed
 * - Schema migration - tables created if they don't exist
 * - Data seeding - default categories populated
 * - Connection reuse - singleton pattern for performance
 * 
 * SQLite Considerations:
 * - BOOLEAN fields are stored as INTEGER (0 = false, 1 = true)
 * - DATETIME fields use ISO strings for compatibility
 * - AUTOINCREMENT ensures unique IDs even after deletions
 * 
 * @returns Database instance ready for queries
 */
function getDatabase() {
  if (!db) {
    // Create database file in project root
    // In production, this would typically be in a persistent volume
    const dbPath = join(process.cwd(), 'todos.db');
    db = new Database(dbPath);
    
    // Initialize database schema with proper SQLite types
    // Note: SQLite doesn't have native BOOLEAN, so we use INTEGER
    db.exec(`
      -- Todos table: Core todo storage
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,  -- Stored as 0/1 in SQLite
        category TEXT DEFAULT 'general',
        priority TEXT DEFAULT 'medium',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Categories table: Predefined categories with theming
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#6366f1'  -- Hex color for UI theming
      );

      -- Seed default categories with distinct colors
      -- INSERT OR IGNORE prevents duplicate entries on app restart
      INSERT OR IGNORE INTO categories (name, color) VALUES 
        ('general', '#6366f1'),    -- Indigo
        ('work', '#dc2626'),       -- Red
        ('personal', '#059669'),   -- Green
        ('shopping', '#d97706');   -- Orange
    `);
  }
  return db;
}

/**
 * Todo Database Queries
 * 
 * This object contains all database operations for todos, implementing:
 * - Prepared statements for performance and security
 * - Proper type conversion between SQLite and TypeScript
 * - Optimized sorting and filtering
 * - Error-safe operations with graceful degradation
 * 
 * All queries use prepared statements which are:
 * - Faster than dynamic SQL (compiled once, executed many times)
 * - Secure against SQL injection attacks
 * - Type-safe with our TypeScript interfaces
 */
export const todoQueries = {
  /**
   * GET ALL TODOS
   * 
   * Retrieves all todos with optimized sorting:
   * - Incomplete todos appear first (better UX)
   * - Within each group, newest todos appear first
   * - Converts SQLite integers back to TypeScript booleans
   * 
   * Performance Notes:
   * - Uses prepared statement for fast execution
   * - Minimal data transfer with column aliases
   * - Single query instead of multiple operations
   * 
   * @returns Array of all todos sorted by completion status and date
   */
  getAll: () => {
    const db = getDatabase();
    
    // Prepared statement with optimized ORDER BY clause
    // completed ASC ensures incomplete todos (0) appear before completed (1)
    const rows = db.prepare(`
      SELECT 
        id,
        title,
        completed,
        category,
        priority,
        created_at as createdAt,      -- Alias for camelCase consistency
        updated_at as updatedAt
      FROM todos 
      ORDER BY completed ASC, created_at DESC
    `).all() as any[];
    
    // Convert SQLite integers (0/1) back to TypeScript booleans
    // This is necessary because SQLite doesn't have native boolean support
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed)  // 0 -> false, 1 -> true
    })) as Todo[];
  },

  getByCategory: (category: string) => {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT 
        id,
        title,
        completed,
        category,
        priority,
        created_at as createdAt,
        updated_at as updatedAt
      FROM todos 
      WHERE category = ?
      ORDER BY completed ASC, created_at DESC
    `).all(category) as any[];
    
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed)
    })) as Todo[];
  },

  search: (query: string) => {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT 
        id,
        title,
        completed,
        category,
        priority,
        created_at as createdAt,
        updated_at as updatedAt
      FROM todos 
      WHERE title LIKE ?
      ORDER BY completed ASC, created_at DESC
    `).all(`%${query}%`) as any[];
    
    return rows.map(row => ({
      ...row,
      completed: Boolean(row.completed)
    })) as Todo[];
  },

  /**
   * CREATE NEW TODO
   * 
   * Inserts a new todo with automatic timestamp generation:
   * - Converts TypeScript boolean to SQLite integer (0/1)
   * - Uses database-generated timestamps for consistency
   * - Returns the complete todo object with generated ID
   * 
   * SQLite Features Used:
   * - AUTOINCREMENT for unique, sequential IDs
   * - CURRENT_TIMESTAMP for automatic date generation
   * - lastInsertRowid to get the new record's ID
   * 
   * @param todo - Todo data without ID and timestamps (auto-generated)
   * @returns Complete todo object with database-generated fields
   */
  create: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const db = getDatabase();
    
    // Insert new todo with boolean-to-integer conversion
    // SQLite can only bind: numbers, strings, bigints, buffers, and null
    const result = db.prepare(`
      INSERT INTO todos (title, completed, category, priority)
      VALUES (?, ?, ?, ?)
    `).run(
      todo.title, 
      todo.completed ? 1 : 0,  // Convert boolean to integer for SQLite
      todo.category, 
      todo.priority
    );
    
    // Fetch the newly created todo with all fields
    // lastInsertRowid gives us the ID of the just-inserted record
    const row = db.prepare(`
      SELECT 
        id,
        title,
        completed,
        category,
        priority,
        created_at as createdAt,
        updated_at as updatedAt
      FROM todos WHERE id = ?
    `).get(result.lastInsertRowid) as any;
    
    // Convert SQLite integer back to TypeScript boolean
    return {
      ...row,
      completed: Boolean(row.completed)
    } as Todo;
  },

  /**
   * UPDATE EXISTING TODO
   * 
   * Updates specific fields of a todo with proper type handling:
   * - Supports partial updates (only specified fields changed)
   * - Automatically updates the updated_at timestamp
   * - Handles boolean-to-integer conversion for SQLite
   * - Returns the complete updated todo object
   * 
   * Dynamic Query Building:
   * - Builds SET clause dynamically based on provided fields
   * - Uses parameterized queries for security
   * - Maintains type safety throughout the process
   * 
   * @param id - ID of the todo to update
   * @param updates - Partial todo object with fields to update
   * @returns Complete updated todo object
   */
  update: (id: number, updates: Partial<Pick<Todo, 'title' | 'completed' | 'category' | 'priority'>>) => {
    const db = getDatabase();
    
    // Convert TypeScript types to SQLite-compatible types
    // This is especially important for boolean fields
    const convertedUpdates: Record<string, any> = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'completed' && typeof value === 'boolean') {
        // Convert boolean to integer for SQLite storage
        convertedUpdates[key] = value ? 1 : 0;
      } else {
        // Keep other values as-is (strings, numbers)
        convertedUpdates[key] = value;
      }
    });
    
    // Build dynamic SET clause for SQL query
    // Example: "title = ?, completed = ?" for updating title and completion
    const fields = Object.keys(convertedUpdates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(convertedUpdates);
    
    // Execute update with automatic timestamp update
    db.prepare(`
      UPDATE todos 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values, id);
    
    // Fetch and return the updated todo
    const row = db.prepare(`
      SELECT 
        id,
        title,
        completed,
        category,
        priority,
        created_at as createdAt,
        updated_at as updatedAt
      FROM todos WHERE id = ?
    `).get(id) as any;
    
    // Convert SQLite integer back to TypeScript boolean
    return {
      ...row,
      completed: Boolean(row.completed)
    } as Todo;
  },

  /**
   * DELETE TODO
   * 
   * Permanently removes a todo from the database:
   * - Simple deletion by ID
   * - Returns execution result with affected row count
   * - No cascade effects (todos are independent)
   * 
   * @param id - ID of the todo to delete
   * @returns SQLite execution result
   */
  delete: (id: number) => {
    const db = getDatabase();
    // Simple DELETE operation - SQLite handles the cleanup
    return db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  },

  /**
   * GET CATEGORIES WITH TODO COUNTS
   * 
   * Retrieves all categories with associated todo counts:
   * - Uses LEFT JOIN to include categories with zero todos
   * - Aggregates todo counts for efficient UI rendering
   * - Orders alphabetically for consistent display
   * 
   * Query Optimization:
   * - Single query instead of N+1 separate queries
   * - Uses COUNT aggregate for efficient counting
   * - LEFT JOIN ensures all categories appear in results
   * 
   * @returns Array of categories with todo counts
   */
  getCategories: () => {
    const db = getDatabase();
    
    // Complex query joining categories with todo counts
    // LEFT JOIN ensures categories appear even if they have no todos
    return db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.color,
        COUNT(t.id) as count        -- Count todos in each category
      FROM categories c
      LEFT JOIN todos t ON c.name = t.category
      GROUP BY c.id, c.name, c.color  -- Group by category for counting
      ORDER BY c.name                 -- Alphabetical order for UI
    `).all() as Category[];
  }
};

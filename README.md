# 🚀 Next.js 15 + React 19 Todo App

A cutting-edge todo application showcasing the latest features from **Next.js 15** and **React 19**. This project demonstrates modern web development patterns, server actions, optimistic updates, and advanced state management.

![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🔥 React 19 Features Implemented
- **`useActionState`** - Form handling with built-in pending states and error management
- **`useOptimistic`** - Immediate UI updates for better user experience
- **Enhanced Concurrent Features** - `useDeferredValue` and `useTransition` for performance
- **Improved Suspense** - Better loading states and error boundaries

### 🚀 Next.js 15 Features Implemented
- **Server Actions** - Type-safe server-side operations with automatic revalidation
- **Enhanced App Router** - Modern routing with improved metadata and SEO
- **Optimized Webpack Config** - Better handling of Node.js modules in client builds
- **Advanced TypeScript Integration** - Full type safety across client and server

### 📋 Todo Management Features
- ✅ **Add Todos** with categories (general, work, personal, shopping) and priorities (low, medium, high)
- ✏️ **Edit Todos** with real-time optimistic updates
- 🔄 **Toggle Completion** with smooth animations
- 🔍 **Real-time Search** with debounced input and concurrent updates
- 🏷️ **Category Filtering** with dynamic counts
- 🗑️ **Delete Todos** with confirmation dialogs
- 📊 **Progress Tracking** with animated statistics
- 🎨 **Beautiful Animations** using Framer Motion

## 🛠️ Tech Stack

- **Framework**: Next.js 15.1.3
- **Frontend**: React 19.0.0
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.4.1
- **Animations**: Framer Motion 12.23.11
- **Database**: SQLite with better-sqlite3
- **State Management**: React 19 hooks (useActionState, useOptimistic)
- **Build Tool**: Next.js with optimized Webpack config

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-next-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page with main todo interface
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── TodoForm.tsx       # Form with useActionState
│   ├── TodoItem.tsx       # Individual todo with useOptimistic
│   └── SearchAndFilter.tsx # Search with concurrent features
├── lib/                   # Business logic
│   ├── actions.ts         # Next.js 15 Server Actions
│   └── database.ts        # SQLite database operations
└── types/                 # TypeScript type definitions
```

## 🔬 React 19 Features Deep Dive

### 1. useActionState Hook
Located in: `src/components/TodoForm.tsx` and `src/components/TodoItem.tsx`

```typescript
const [state, formAction, isPending] = useActionState(createTodoAction, {
  success: false,
  message: '',
  error: '',
  data: undefined
});
```

**Benefits:**
- Built-in pending states
- Automatic error handling
- Seamless integration with server actions
- Type-safe state management

### 2. useOptimistic Hook
Located in: `src/components/TodoForm.tsx` and `src/components/TodoItem.tsx`

```typescript
const [optimisticTodo, setOptimisticTodo] = useOptimistic(
  todo,
  (currentTodo, action) => {
    // Immediate UI updates before server response
    switch (action.type) {
      case 'toggle':
        return { ...currentTodo, completed: !currentTodo.completed };
      // ... other cases
    }
  }
);
```

**Benefits:**
- Instant UI feedback
- Better user experience
- Automatic rollback on errors
- Maintains consistency with server state

### 3. Enhanced Concurrent Features
Located in: `src/components/SearchAndFilter.tsx`

```typescript
const deferredSearchQuery = useDeferredValue(searchQuery);
const [isPending, startTransition] = useTransition();

// All optimistic updates wrapped in startTransition
startTransition(() => {
  setOptimisticMessage('Creating todo...');
});
```

**Benefits:**
- Non-blocking UI updates
- Better performance during heavy operations
- Smooth user interactions
- Prioritized updates

## 🌐 Next.js 15 Features Deep Dive

### 1. Server Actions
Located in: `src/lib/actions.ts`

```typescript
'use server';

export async function createTodoAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // Server-side validation and processing
  // Automatic revalidation with revalidatePath
}
```

**Benefits:**
- Type-safe client-server communication
- Automatic form handling
- Built-in error states
- Seamless data mutations

### 2. Enhanced App Router
Located in: `src/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: 'Next.js 15 + React 19 Todo App',
  description: '...',
  keywords: ['Next.js', 'React 19', 'Todo App'],
  openGraph: { /* ... */ }
};
```

**Benefits:**
- Better SEO optimization
- Improved metadata handling
- Type-safe routing
- Enhanced performance

## 🗄️ Database Design

The app uses SQLite with the following schema:

### Todos Table
```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6366f1'
);
```

## ⚡ Performance Optimizations

### 1. State Management
- **Local Category Updates**: Category counts update locally instead of server round trips
- **Memoized Callbacks**: All callbacks use `useCallback` to prevent unnecessary re-renders
- **Optimized Dependencies**: Specific `useEffect` dependencies to avoid infinite loops

### 2. Concurrent Features
- **Debounced Search**: Uses `useDeferredValue` for smooth typing experience
- **Non-blocking Updates**: All state updates wrapped in `startTransition`
- **Optimistic Updates**: Immediate feedback with server validation

### 3. Database Optimizations
- **SQLite Type Handling**: Proper boolean to integer conversion for SQLite compatibility
- **Prepared Statements**: All queries use prepared statements for security and performance
- **Indexed Queries**: Optimized database schema with proper indexing

## 🎨 UI/UX Features

### Design System
- **Color-coded Categories**: Each category has a distinct color for visual organization
- **Priority Indicators**: Emoji-based priority system (🔴 High, 🟡 Medium, 🟢 Low)
- **Progress Visualization**: Animated progress bars showing completion statistics
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Animations
- **Framer Motion**: Smooth transitions and micro-interactions
- **Loading States**: Skeleton screens and spinners for better perceived performance
- **Optimistic Feedback**: Instant visual feedback for user actions

## 🧪 Testing the Features

### React 19 Features
1. **useActionState**: Try adding a todo - notice the automatic loading states
2. **useOptimistic**: Toggle a todo completion - see instant UI updates
3. **Concurrent Features**: Type in the search box - smooth, non-blocking updates

### Next.js 15 Features
1. **Server Actions**: All CRUD operations happen server-side with type safety
2. **App Router**: Check the metadata in browser dev tools
3. **Performance**: Notice the fast page loads and optimized bundles

## 🐛 Troubleshooting

### Common Issues

1. **SQLite Binding Error**
   ```
   Error: SQLite3 can only bind numbers, strings, bigints, buffers, and null
   ```
   **Solution**: Already fixed - booleans are converted to integers (0/1) for SQLite

2. **Optimistic State Error**
   ```
   Error: An optimistic state update occurred outside a transition
   ```
   **Solution**: Already fixed - all optimistic updates wrapped in `startTransition`

3. **Infinite Network Requests**
   **Solution**: Already fixed - proper `useEffect` dependencies and memoized callbacks

## 📚 Learning Resources

- [React 19 Documentation](https://react.dev/blog/2024/04/25/react-19)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [useActionState Guide](https://react.dev/reference/react/useActionState)
- [useOptimistic Guide](https://react.dev/reference/react/useOptimistic)
- [Server Actions Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing React 19 features
- Vercel team for Next.js 15 improvements
- The open-source community for all the great libraries used

---

**Built with ❤️ using the latest React 19 and Next.js 15 features**

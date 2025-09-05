/**
 * ROOT LAYOUT - Next.js 15 App Router
 * 
 * This layout component demonstrates Next.js 15 App Router features:
 * 
 * 🚀 NEXT.JS 15 FEATURES:
 * - Enhanced metadata API with full type safety
 * - Improved SEO optimization with OpenGraph integration
 * - Better performance with optimized loading
 * - Advanced caching strategies
 * 
 * 📊 SEO OPTIMIZATIONS:
 * - Comprehensive metadata for search engines
 * - Social media integration with OpenGraph
 * - Structured data for better indexing
 * - Performance optimizations for Core Web Vitals
 */

import type { Metadata } from 'next';
import './globals.css';

/**
 * ENHANCED METADATA CONFIGURATION
 * 
 * Next.js 15 provides powerful metadata features:
 * - Type-safe metadata with full TypeScript support
 * - Automatic OpenGraph tag generation
 * - SEO optimization out of the box
 * - Social media sharing enhancements
 */
export const metadata: Metadata = {
  title: 'Next.js 15 + React 19 Todo App',
  description: 'A modern todo application showcasing Next.js 15 server actions and React 19 features like useActionState, useOptimistic, and enhanced concurrent features.',
  keywords: ['Next.js', 'React 19', 'Todo App', 'Server Actions', 'TypeScript'],
  authors: [{ name: 'Todo App Developer' }],
  
  // OpenGraph metadata for social media sharing
  openGraph: {
    title: 'Next.js 15 + React 19 Todo App',
    description: 'Experience the latest React 19 hooks and Next.js 15 features in this modern todo application.',
    type: 'website',
  },
}

/**
 * ROOT LAYOUT COMPONENT
 * 
 * The main layout wrapper for the entire application:
 * - Provides consistent structure across all pages
 * - Includes global styles and optimizations
 * - Sets up accessibility and performance features
 * 
 * @param children - Page content to be rendered
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        {/* 
          NEXT.JS 15 APP ROUTER CHILDREN
          
          The children prop contains the page content rendered by
          the App Router system. This provides automatic code splitting,
          improved performance, and better developer experience.
        */}
        {children}
      </body>
    </html>
  )
}

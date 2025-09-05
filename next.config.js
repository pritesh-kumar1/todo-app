/**
 * NEXT.JS 15 CONFIGURATION
 * 
 * This configuration file demonstrates modern Next.js setup patterns:
 * 
 * 🚀 NEXT.JS 15 FEATURES:
 * - Server actions enabled by default (no experimental flag needed)
 * - Optimized webpack configuration for Node.js modules
 * - Better handling of SQLite in browser environments
 * - Enhanced build optimizations
 * 
 * 🔧 WEBPACK OPTIMIZATIONS:
 * - Client-side fallbacks for Node.js-only modules
 * - Prevents SQLite from breaking browser builds
 * - Maintains separation between server and client code
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Server actions are enabled by default in Next.js 15
    // No experimental flags needed for production-ready features
  },
  
  /**
   * WEBPACK CONFIGURATION FOR NODE.JS MODULES
   * 
   * This webpack config resolves issues with Node.js-only modules in client builds:
   * - better-sqlite3 uses Node.js APIs that don't exist in browsers
   * - We provide fallbacks to prevent build errors
   * - Server-side code continues to work normally
   * 
   * Without this configuration, you'd get errors like:
   * "Module not found: Can't resolve 'fs'"
   */
  webpack: (config, { isServer }) => {
    // Only apply fallbacks to client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,      // File system access (Node.js only)
        path: false,    // Path manipulation (Node.js only) 
        crypto: false,  // Cryptographic functions (Node.js only)
      };
    }
    return config;
  },
};

module.exports = nextConfig;
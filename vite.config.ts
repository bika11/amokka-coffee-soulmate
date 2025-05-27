
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "405e9700-f805-432a-8705-fdfa0bb79cf0.lovableproject.com",
      "localhost",
    ],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Simplified build configuration to avoid conflicts
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'forms': ['react-hook-form', '@hookform/resolvers'],
        },
      },
    },
    // Use default minifier instead of terser to avoid dependency issues
    minify: true,
    // Generate source maps for production builds
    sourcemap: true,
  },
  // Optimize asset loading
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
}));

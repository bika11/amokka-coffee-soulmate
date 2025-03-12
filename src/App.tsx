
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CoffeeRecommendationProvider } from "./contexts/CoffeeRecommendationContext";

// Lazy loaded components
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AppChatBot = lazy(() => import("./components/AppChatBot").then(module => ({ default: module.AppChatBot })));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-48">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CoffeeRecommendationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen w-full flex flex-col">
              <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-7xl">
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </div>
                <Suspense fallback={null}>
                  <AppChatBot />
                </Suspense>
              </main>
            </div>
          </BrowserRouter>
        </CoffeeRecommendationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AppChatBot } from "./components/AppChatBot";
import { CoffeeRecommendationProvider } from "./contexts/CoffeeRecommendationContext";

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
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <AppChatBot />
              </main>
            </div>
          </BrowserRouter>
        </CoffeeRecommendationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

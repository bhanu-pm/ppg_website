// src/App.tsx

import { Amplify } from 'aws-amplify';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

Amplify.configure({
  Storage: {
    S3: {
      // This should be your S3 bucket's region (e.g., 'us-east-1')
      region: 'us-east-1', 
      // This is your S3 bucket name
      bucket: 'pcg-comment-storage',
    }
  },
  Auth: {}
});

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TemplateList from "./pages/TemplateList";
import TemplateDesigner from "./pages/TemplateDesigner";
import CertificateGenerator from "./pages/CertificateGenerator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <TemplateList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/designer"
            element={
              <ProtectedRoute>
                <TemplateDesigner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/designer/:id"
            element={
              <ProtectedRoute>
                <TemplateDesigner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <ProtectedRoute>
                <CertificateGenerator />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/i18n/config";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppStoreProvider } from "./store/useAppStore";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ComingSoon from "./pages/ComingSoon";
import Risks from "./pages/Risks";
import NotFound from "./pages/NotFound";
import Meal from "./pages/Meal";
import Finance from "./pages/Finance";
import AuditLogs from "./pages/AuditLogs";
import Suppliers from "./pages/Suppliers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppStoreProvider>
      <ErrorBoundary>
        <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen bg-background">
                  <Sidebar />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/meal" element={<Meal />} />
                    <Route path="/meal/:projectId" element={<Meal />} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                    <Route path="/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
                    <Route path="/financial" element={<Finance />} />
                    <Route path="/risks" element={<Risks />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/reports" element={<ComingSoon title="Reports & Analytics" subtitle="Dashboards & Insights" description="This module will provide comprehensive reporting and analytics capabilities." />} />
                    <Route path="/settings" element={<ComingSoon title="Settings" subtitle="System Configuration" description="Configure users, permissions, and system preferences." />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </ErrorBoundary>
      </AppStoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

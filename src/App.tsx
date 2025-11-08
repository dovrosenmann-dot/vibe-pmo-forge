import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/meal" element={<ComingSoon title="MEAL" subtitle="Monitoring, Evaluation, Accountability & Learning" description="This module will allow you to track indicators, collect evidence, and generate impact reports." />} />
            <Route path="/financial" element={<ComingSoon title="Financial Management" subtitle="Budgets, Grants & Invoices" description="This module will help you manage project budgets, track expenses, and process invoices." />} />
            <Route path="/risks" element={<ComingSoon title="Risk Management" subtitle="Identify, Track & Mitigate Risks" description="This module will enable comprehensive risk tracking and mitigation planning." />} />
            <Route path="/suppliers" element={<ComingSoon title="Suppliers & Contracts" subtitle="Manage Vendors & Consultants" description="This module will help you manage suppliers, consultants, and their contracts." />} />
            <Route path="/reports" element={<ComingSoon title="Reports & Analytics" subtitle="Dashboards & Insights" description="This module will provide comprehensive reporting and analytics capabilities." />} />
            <Route path="/settings" element={<ComingSoon title="Settings" subtitle="System Configuration" description="Configure users, permissions, and system preferences." />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

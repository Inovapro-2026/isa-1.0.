import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import NotFound from "./pages/NotFound";

// Admin Dashboard Pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import WhatsAppBot from "./pages/dashboard/WhatsAppBot";
import Conversations from "./pages/dashboard/Conversations";
import Requests from "./pages/dashboard/Requests";
import Support from "./pages/dashboard/Support";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";

// Client Dashboard Pages
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import ClientWhatsApp from "./pages/client/ClientWhatsApp";
import ClientSupport from "./pages/client/ClientSupport";
import ClientProfile from "./pages/client/ClientProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/whatsapp-bot" element={<WhatsAppBot />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/support" element={<Support />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          {/* Client Routes */}
          <Route path="/dashboard/client" element={<ClientDashboard />} />
          <Route path="/client/whatsapp" element={<ClientWhatsApp />} />
          <Route path="/client/support" element={<ClientSupport />} />
          <Route path="/client/profile" element={<ClientProfile />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

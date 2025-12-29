import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import AguardandoAprovacao from "./pages/AguardandoAprovacao";
import NotFound from "./pages/NotFound";

// Admin Dashboard Pages
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import MeuWhatsApp from "./pages/dashboard/MeuWhatsApp";
import MemoriaIA from "./pages/dashboard/MemoriaIA";
import Chat from "./pages/dashboard/Chat";
import Requests from "./pages/dashboard/Requests";
import Clients from "./pages/dashboard/Clients";
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
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/aguardando-aprovacao" element={<AguardandoAprovacao />} />

            {/* Admin Routes */}
            <Route path="/dashboard/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/whatsapp-bot" element={
              <ProtectedRoute requireAdmin>
                <MeuWhatsApp />
              </ProtectedRoute>
            } />
            <Route path="/memoria-ia" element={
              <ProtectedRoute requireAdmin>
                <MemoriaIA />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute requireAdmin>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/requests" element={
              <ProtectedRoute requireAdmin>
                <Requests />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute requireAdmin>
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute requireAdmin>
                <Support />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requireAdmin>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requireAdmin>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Client Routes */}
            <Route path="/dashboard/client" element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/client/whatsapp" element={
              <ProtectedRoute>
                <ClientWhatsApp />
              </ProtectedRoute>
            } />
            <Route path="/client/support" element={
              <ProtectedRoute>
                <ClientSupport />
              </ProtectedRoute>
            } />
            <Route path="/client/profile" element={
              <ProtectedRoute>
                <ClientProfile />
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

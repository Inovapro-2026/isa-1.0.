import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  clientOnly?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false, clientOnly = false }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin trying to access client-only routes
  if (clientOnly && isAdmin) {
    return <Navigate to="/dashboard/admin" replace />;
  }

  // Client trying to access admin routes
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard/client" replace />;
  }

  // Non-admin trying to access admin routes (extra check)
  if (!clientOnly && !requireAdmin && isAdmin) {
    // Admin accessing general protected routes - allow but might want to redirect
  }

  return <>{children}</>;
}

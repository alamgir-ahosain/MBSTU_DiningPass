import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Spinner = () => (
  <div className="flex items-center justify-center h-screen">
    <p className="text-muted-foreground text-sm">Loading...</p>
  </div>
);

export const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
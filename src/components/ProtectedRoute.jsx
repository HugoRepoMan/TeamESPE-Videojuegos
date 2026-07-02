import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hud-bg">
        <div className="animate-pulse-red w-8 h-8 border-2 border-hud-accent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

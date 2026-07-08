import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export default function JudgeRoute({ children }) {
  const { user, loading, isAdmin, isJuez } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hud-bg">
        <div className="w-8 h-8 border-4 border-hud-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin && !isJuez) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

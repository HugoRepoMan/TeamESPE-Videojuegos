import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';

export default function PageShell({ title, children, showBack = false }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-hud-bg">
      {/* Top Global Nav */}
      <nav className="border-b border-hud-border bg-hud-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-hud-text-secondary hover:text-hud-accent transition-colors">
            <Home size={16} />
            <span className="text-sm font-bold uppercase tracking-wider">Inicio</span>
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-hud-text-secondary hover:text-hud-error transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span className="text-sm font-bold uppercase tracking-wider">Cerrar Sesion</span>
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-hud-text-secondary hover:text-hud-accent transition-colors cursor-pointer"
              aria-label="Volver"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-hud-accent" />
            <h1 className="text-2xl font-bold uppercase tracking-wider text-hud-text">
              {title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}

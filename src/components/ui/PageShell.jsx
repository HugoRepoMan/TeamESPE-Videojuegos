import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageShell({ title, children, showBack = false }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hud-bg">
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

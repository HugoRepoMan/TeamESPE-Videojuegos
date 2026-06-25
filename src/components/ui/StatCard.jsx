import { TrendingUp } from 'lucide-react';

const VARIANT_CLASSES = {
  default: 'border-hud-border',
  accent: 'border-hud-accent hud-glow',
  gold: 'border-hud-gold hud-glow-gold',
  success: 'border-hud-success',
};

const ICON_VARIANT_CLASSES = {
  default: 'text-hud-text-secondary',
  accent: 'text-hud-accent',
  gold: 'text-hud-gold',
  success: 'text-hud-success',
};

export default function StatCard({ label, value, icon: Icon, trend, variant = 'default' }) {
  return (
    <div className={`bg-hud-surface border ${VARIANT_CLASSES[variant]} p-5 clip-diagonal relative`}>
      {trend && (
        <div className="absolute top-3 right-4 flex items-center gap-1 text-hud-success text-xs font-bold">
          <TrendingUp size={12} />
          <span>{trend}</span>
        </div>
      )}
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`p-2 bg-hud-bg rounded ${ICON_VARIANT_CLASSES[variant]}`}>
            <Icon size={24} />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-hud-text">{value}</span>
          <span className="text-sm text-hud-text-secondary mt-1 uppercase tracking-wider">{label}</span>
        </div>
      </div>
    </div>
  );
}

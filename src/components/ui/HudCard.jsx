export default function HudCard({ children, className = '', variant = 'default', clip = 'none' }) {
  const variantClasses = {
    default: 'border-hud-border',
    accent: 'border-hud-accent hud-glow',
    gold: 'border-hud-gold hud-glow-gold',
  };

  const clipClasses = {
    none: '',
    diagonal: 'clip-diagonal',
    both: 'clip-diagonal-both',
  };

  return (
    <div className={`bg-hud-surface border ${variantClasses[variant]} ${clipClasses[clip]} p-6 ${className}`}>
      {children}
    </div>
  );
}

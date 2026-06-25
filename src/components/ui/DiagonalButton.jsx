export default function DiagonalButton({ children, onClick, variant = 'primary', disabled = false, type = 'button', className = '' }) {
  const variants = {
    primary: 'bg-hud-accent hover:bg-hud-accent-hover text-white',
    secondary: 'bg-hud-surface border border-hud-border hover:border-hud-accent text-hud-text',
    danger: 'bg-hud-error hover:bg-red-600 text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`clip-diagonal px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all duration-200 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud-accent ${className}`}
    >
      {children}
    </button>
  );
}

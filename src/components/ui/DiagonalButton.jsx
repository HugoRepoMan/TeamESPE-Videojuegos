import { Link } from 'react-router-dom';

export default function DiagonalButton({ children, onClick, variant = 'primary', disabled = false, type = 'button', className = '', to, href }) {
  const variants = {
    primary: 'bg-hud-accent hover:bg-hud-accent-hover text-white',
    secondary: 'bg-hud-surface border border-hud-border hover:border-hud-accent text-hud-text',
    danger: 'bg-hud-error hover:bg-red-600 text-white',
  };

  const classes = `clip-diagonal px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all duration-200 ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud-accent ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}

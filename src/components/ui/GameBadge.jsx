const GAME_COLORS = {
  'clash-royale': '#f59e0b',
  'fortnite': '#8b5cf6',
  'minecraft': '#22c55e',
  'league-of-legends': '#3b82f6',
  'dragon-ball': '#f97316',
  'fifa-26': '#06b6d4',
  'mortal-kombat': '#ef4444',
};

export default function GameBadge({ name, slug, className = '' }) {
  const color = GAME_COLORS[slug] || '#a0a0a0';

  return (
    <div
      className={`inline-flex items-center gap-2 bg-hud-bg px-3 py-1.5 text-sm font-semibold tracking-wide border-l-3 ${className}`}
      style={{ borderLeftColor: color }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-hud-text">{name}</span>
    </div>
  );
}

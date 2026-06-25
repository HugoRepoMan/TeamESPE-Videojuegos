export default function SectionTitle({ children, className = '' }) {
  return (
    <div className={`flex items-center gap-3 mb-6 ${className}`}>
      <div className="w-1 h-7 bg-hud-accent flex-shrink-0" />
      <h2 className="text-xl font-bold uppercase tracking-wider text-hud-text">
        {children}
      </h2>
    </div>
  );
}

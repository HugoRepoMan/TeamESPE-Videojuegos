const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    classes: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  },
  approved: {
    label: 'Aprobado',
    classes: 'bg-green-500/20 text-green-400 border-green-500/40',
  },
  rejected: {
    label: 'Rechazado',
    classes: 'bg-red-500/20 text-red-400 border-red-500/40',
  },
  scheduled: {
    label: 'Programado',
    classes: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  },
  live: {
    label: 'En Vivo',
    classes: 'bg-red-600/30 text-red-400 border-red-500/50 animate-pulse-red',
  },
  finished: {
    label: 'Finalizado',
    classes: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
  },
  walkover: {
    label: 'W.O.',
    classes: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  },
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider border rounded ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}

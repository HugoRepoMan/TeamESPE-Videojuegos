import { Users, DollarSign, Trophy, Layout, CreditCard, Tv } from 'lucide-react';
import HudCard from '../../components/ui/HudCard';
import StatCard from '../../components/ui/StatCard';
import DiagonalButton from '../../components/ui/DiagonalButton';
import SectionTitle from '../../components/ui/SectionTitle';

const SEED_METRICS = {
  totalPlayers: 48,
  totalRevenue: 96.0,
  totalRegistrations: 64,
  pendingPayments: 12,
};

const NAV_CARDS = [
  {
    icon: CreditCard,
    title: 'Gestion de Pagos',
    description: 'Aprobar o rechazar pagos de inscripcion de los participantes.',
    href: '/admin/payments',
  },
  {
    icon: Trophy,
    title: 'Brackets del Torneo',
    description: 'Generar y administrar los brackets de eliminacion por disciplina.',
    href: '/admin/brackets',
  },
  {
    icon: DollarSign,
    title: 'Tesoreria',
    description: 'Resumen financiero, ingresos por disciplina y exportar reportes.',
    href: '/admin/treasury',
  },
  {
    icon: Tv,
    title: 'Control de Overlay',
    description: 'Controlar el overlay en vivo para transmisiones en OBS Studio.',
    href: '/admin/overlay-control',
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <SectionTitle>Panel de Administracion</SectionTitle>
      <p className="text-gray-400 mb-8">
        Gestion central del torneo ESPE Gaming.
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Jugadores"
          value={SEED_METRICS.totalPlayers}
          variant="default"
        />
        <StatCard
          icon={DollarSign}
          label="Total Recaudado"
          value={`$${SEED_METRICS.totalRevenue.toFixed(2)}`}
          variant="success"
        />
        <StatCard
          icon={Layout}
          label="Inscripciones Totales"
          value={SEED_METRICS.totalRegistrations}
          variant="info"
        />
        <StatCard
          icon={CreditCard}
          label="Pagos Pendientes"
          value={SEED_METRICS.pendingPayments}
          variant="warning"
        />
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {NAV_CARDS.map((card) => (
          <HudCard key={card.href}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/30">
                <card.icon className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-200 mb-1">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">{card.description}</p>
                <DiagonalButton href={card.href}>Acceder</DiagonalButton>
              </div>
            </div>
          </HudCard>
        ))}
      </div>
    </div>
  );
}

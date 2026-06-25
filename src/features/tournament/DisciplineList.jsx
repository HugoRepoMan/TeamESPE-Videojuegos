import { Gamepad2 } from 'lucide-react';
import GameBadge from '../../components/ui/GameBadge';
import HudCard from '../../components/ui/HudCard';
import SectionTitle from '../../components/ui/SectionTitle';

const DISCIPLINES = [
  { id: 'clash-royale', name: 'Clash Royale', slug: 'clash-royale', mode: '1v1', active: true, registrations: 12 },
  { id: 'fortnite', name: 'Fortnite', slug: 'fortnite', mode: 'Solo', active: true, registrations: 8 },
  { id: 'minecraft', name: 'Minecraft', slug: 'minecraft', mode: 'Equipo', active: true, registrations: 6 },
  { id: 'league-of-legends', name: 'League of Legends', slug: 'league-of-legends', mode: '5v5', active: true, registrations: 15 },
  { id: 'dragon-ball', name: 'Dragon Ball Sparking Zero', slug: 'dragon-ball', mode: '1v1', active: true, registrations: 10 },
  { id: 'fifa-26', name: 'FIFA 26', slug: 'fifa-26', mode: '1v1', active: true, registrations: 9 },
  { id: 'mortal-kombat', name: 'Mortal Kombat', slug: 'mortal-kombat', mode: '1v1', active: false, registrations: 4 },
];

export default function DisciplineList() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="flex items-center gap-3 mb-2">
        <Gamepad2 className="w-6 h-6 text-red-500" />
        <SectionTitle>Disciplinas del Torneo</SectionTitle>
      </div>
      <p className="text-gray-400 mb-8">
        Consulta las disciplinas disponibles y la cantidad de participantes inscritos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DISCIPLINES.map((discipline) => (
          <HudCard key={discipline.id}>
            <div className="flex items-start justify-between mb-3">
              <GameBadge name={discipline.name} />
              <span
                className={`text-xs px-2 py-0.5 border ${
                  discipline.active
                    ? 'border-green-500/50 text-green-400 bg-green-500/10'
                    : 'border-gray-600 text-gray-500 bg-gray-800/50'
                }`}
              >
                {discipline.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Modo</span>
                <span className="text-gray-200">{discipline.mode}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Inscritos</span>
                <span className="text-red-400 font-semibold">{discipline.registrations}</span>
              </div>
            </div>
            {discipline.active && (
              <a
                href={`/brackets?discipline=${discipline.slug}`}
                className="block mt-4 text-center text-xs text-red-400 border border-red-500/30 py-2 hover:bg-red-500/10 transition-colors"
              >
                Ver Bracket
              </a>
            )}
          </HudCard>
        ))}
      </div>
    </div>
  );
}

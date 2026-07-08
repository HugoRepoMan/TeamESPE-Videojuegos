import { useState } from 'react';
import { Swords, Loader2 } from 'lucide-react';
import HudCard from '../../components/ui/HudCard';
import StatusBadge from '../../components/ui/StatusBadge';
import GameBadge from '../../components/ui/GameBadge';
import { useCollection } from '../../hooks/useFirestore';
import { where } from 'firebase/firestore';

const DISCIPLINES = [
  { id: 'clash-royale', name: 'Clash Royale', slug: 'clash-royale' },
  { id: 'fortnite', name: 'Fortnite', slug: 'fortnite' },
  { id: 'minecraft', name: 'Minecraft', slug: 'minecraft' },
  { id: 'league-of-legends', name: 'League of Legends', slug: 'league-of-legends' },
  { id: 'dragon-ball', name: 'Dragon Ball Sparking Zero', slug: 'dragon-ball' },
  { id: 'fifa-26', name: 'FIFA 26', slug: 'fifa-26' },
  { id: 'mortal-kombat', name: 'Mortal Kombat', slug: 'mortal-kombat' },
];

const ROUND_COLORS = [
  'border-l-blue-500',
  'border-l-purple-500',
  'border-l-red-500',
  'border-l-yellow-500',
];

export default function BracketView() {
  const [selectedDiscipline, setSelectedDiscipline] = useState('clash-royale');

  // Real-time listener for matches of the selected discipline
  const { data: dbMatches, loading } = useCollection('matches', [
    where('disciplineId', '==', selectedDiscipline)
  ]);

  // Sort matches locally to ensure proper bracket tree rendering
  const matches = [...dbMatches].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.bracketPosition - b.bracketPosition;
  });

  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
  const discipline = DISCIPLINES.find((d) => d.id === selectedDiscipline);

  function getRoundLabel(round, totalRounds) {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semifinal';
    return `Ronda ${round}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Swords className="w-6 h-6 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-100">Brackets del Torneo</h1>
      </div>

      {/* Discipline Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDiscipline(d.id)}
              className={`px-4 py-2 text-sm border transition-colors ${
                selectedDiscipline === d.id
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Discipline Badge */}
      {discipline && (
        <div className="mb-4">
          <GameBadge name={discipline.name} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : matches.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-8 min-w-max">
            {rounds.map((round, roundIndex) => {
              const roundMatches = matches.filter((m) => m.round === round);
              const colorClass = ROUND_COLORS[roundIndex % ROUND_COLORS.length];
              return (
                <div key={round} className="flex flex-col gap-4 min-w-64">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">
                    {getRoundLabel(round, rounds.length)}
                  </h4>
                  <div className="flex flex-col gap-4 justify-around flex-1">
                    {roundMatches.map((match) => (
                      <HudCard key={match.id} className={`border-l-2 ${colorClass}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            Partida {match.matchIndex !== undefined ? match.matchIndex + 1 : match.id}
                          </span>
                          <StatusBadge status={match.status} />
                        </div>
                        <div className="space-y-1">
                          <div
                            className={`flex justify-between items-center px-2 py-1 text-sm ${
                              match.winnerId === match.playerAId && match.winnerId != null
                                ? 'bg-green-500/10 text-green-300'
                                : 'text-gray-300'
                            }`}
                          >
                            <span className="truncate pr-2">{match.playerAName || 'Por definir'}</span>
                            <span className="font-bold">{match.playerAScore || 0}</span>
                          </div>
                          <div
                            className={`flex justify-between items-center px-2 py-1 text-sm ${
                              match.winnerId === match.playerBId && match.winnerId != null
                                ? 'bg-green-500/10 text-green-300'
                                : 'text-gray-300'
                            }`}
                          >
                            <span className="truncate pr-2">{match.playerBName || 'Por definir'}</span>
                            <span className="font-bold">{match.playerBScore || 0}</span>
                          </div>
                        </div>
                      </HudCard>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <HudCard>
          <p className="text-gray-500 text-center py-8">
            No hay brackets generados para esta disciplina todavía.
          </p>
        </HudCard>
      )}
    </div>
  );
}

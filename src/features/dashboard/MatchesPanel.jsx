import { Swords, Clock, Trophy } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import HudCard from '../../components/ui/HudCard';
import StatusBadge from '../../components/ui/StatusBadge';
import SectionTitle from '../../components/ui/SectionTitle';

const SEED_MATCHES = [
  {
    id: 'm1',
    discipline: 'Clash Royale',
    round: 'Cuartos de Final',
    playerAId: 'current-user',
    playerAName: 'Tu',
    playerBId: 'opp1',
    playerBName: 'DragonSlayer',
    playerAScore: 2,
    playerBScore: 1,
    status: 'completed',
    games: [
      { game: 1, scoreA: 1, scoreB: 0 },
      { game: 2, scoreA: 0, scoreB: 1 },
      { game: 3, scoreA: 1, scoreB: 0 },
    ],
  },
  {
    id: 'm2',
    discipline: 'League of Legends',
    round: 'Semifinal',
    playerAId: 'current-user',
    playerAName: 'Tu',
    playerBId: 'opp2',
    playerBName: 'ShadowMage',
    playerAScore: 0,
    playerBScore: 0,
    status: 'scheduled',
    games: [],
  },
  {
    id: 'm3',
    discipline: 'FIFA 26',
    round: 'Ronda 1',
    playerAId: 'opp3',
    playerAName: 'GoalKing',
    playerBId: 'current-user',
    playerBName: 'Tu',
    playerAScore: 1,
    playerBScore: 2,
    status: 'completed',
    games: [
      { game: 1, scoreA: 1, scoreB: 0 },
      { game: 2, scoreA: 0, scoreB: 1 },
      { game: 3, scoreA: 0, scoreB: 1 },
    ],
  },
  {
    id: 'm4',
    discipline: 'Mortal Kombat',
    round: 'Cuartos de Final',
    playerAId: 'current-user',
    playerAName: 'Tu',
    playerBId: 'opp4',
    playerBName: 'FatalBlow',
    playerAScore: 0,
    playerBScore: 0,
    status: 'live',
    games: [
      { game: 1, scoreA: 1, scoreB: 0 },
    ],
  },
];

function getStatusIcon(status) {
  switch (status) {
    case 'completed':
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    case 'live':
      return <Swords className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
}

function isCurrentUser(playerId) {
  return playerId === 'current-user';
}

export default function MatchesPanel() {
  const { user } = useAuth();
  void user;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <SectionTitle>Mis Partidas</SectionTitle>

      {SEED_MATCHES.length === 0 ? (
        <HudCard>
          <p className="text-gray-500 text-center py-8">
            No tienes partidas asignadas todavia.
          </p>
        </HudCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SEED_MATCHES.map((match) => (
            <HudCard key={match.id}>
              {/* Match Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(match.status)}
                  <span className="text-sm text-gray-400">{match.discipline}</span>
                </div>
                <StatusBadge status={match.status} />
              </div>

              {/* Round */}
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                {match.round}
              </p>

              {/* Players and Scores */}
              <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700 p-3">
                <div className="flex-1 text-left">
                  <p
                    className={`font-semibold ${
                      isCurrentUser(match.playerAId) ? 'text-red-400' : 'text-gray-200'
                    }`}
                  >
                    {match.playerAName}
                  </p>
                </div>
                <div className="flex items-center gap-3 px-4">
                  <span className="text-2xl font-bold text-gray-100">
                    {match.playerAScore}
                  </span>
                  <Swords className="w-5 h-5 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-100">
                    {match.playerBScore}
                  </span>
                </div>
                <div className="flex-1 text-right">
                  <p
                    className={`font-semibold ${
                      isCurrentUser(match.playerBId) ? 'text-red-400' : 'text-gray-200'
                    }`}
                  >
                    {match.playerBName}
                  </p>
                </div>
              </div>

              {/* Bo3 Game Breakdown */}
              {match.games.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Desglose Bo3
                  </p>
                  <div className="space-y-1">
                    {match.games.map((game) => (
                      <div
                        key={game.game}
                        className="flex items-center justify-between text-xs bg-gray-800/30 px-3 py-1"
                      >
                        <span className="text-gray-500">Juego {game.game}</span>
                        <span className="text-gray-300">
                          {game.scoreA} - {game.scoreB}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </HudCard>
          ))}
        </div>
      )}
    </div>
  );
}

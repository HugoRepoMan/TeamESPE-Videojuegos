import { Swords, Clock, Trophy, Calendar } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useState, useEffect } from 'react';
import { getMatchesByUser } from '../../firebase/services';
import HudCard from '../../components/ui/HudCard';
import StatusBadge from '../../components/ui/StatusBadge';
import SectionTitle from '../../components/ui/SectionTitle';

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

export default function MatchesPanel() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      if (!user) return;
      try {
        const userMatches = await getMatchesByUser(user.uid);
        // Sort by round (optional)
        userMatches.sort((a, b) => (a.round || 0) - (b.round || 0));
        setMatches(userMatches);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [user]);

  function isCurrentUser(playerId) {
    return playerId === user?.uid;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <SectionTitle>Mis Partidas</SectionTitle>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Cargando partidas...</div>
      ) : matches.length === 0 ? (
        <HudCard>
          <p className="text-gray-500 text-center py-8">
            No tienes partidas asignadas todavía.
          </p>
        </HudCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => (
            <HudCard key={match.id}>
              {/* Match Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(match.status)}
                  <span className="text-sm text-gray-400">Ronda {match.round}</span>
                </div>
                <StatusBadge status={match.status} />
              </div>

              {/* Scheduled Time */}
              {match.scheduledTime && (
                <div className="mb-4 flex items-center gap-2 text-sm text-yellow-400 font-semibold bg-yellow-400/10 px-3 py-1 rounded w-fit">
                  <Calendar className="w-4 h-4" />
                  {new Date(match.scheduledTime).toLocaleString()}
                </div>
              )}

              {/* Players and Scores */}
              <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700 p-3">
                <div className="flex-1 text-left">
                  <p
                    className={`font-semibold ${
                      isCurrentUser(match.playerAId) ? 'text-red-400' : 'text-gray-200'
                    }`}
                  >
                    {match.playerAName || 'Por definir'}
                  </p>
                </div>
                <div className="flex items-center gap-3 px-4">
                  <span className="text-2xl font-bold text-gray-100">
                    {match.playerAScore || 0}
                  </span>
                  <Swords className="w-5 h-5 text-gray-600" />
                  <span className="text-2xl font-bold text-gray-100">
                    {match.playerBScore || 0}
                  </span>
                </div>
                <div className="flex-1 text-right">
                  <p
                    className={`font-semibold ${
                      isCurrentUser(match.playerBId) ? 'text-red-400' : 'text-gray-200'
                    }`}
                  >
                    {match.playerBName || 'Por definir'}
                  </p>
                </div>
              </div>

              {/* Bo3 Game Breakdown */}
              {match.bo3Games && match.bo3Games.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Desglose Bo3
                  </p>
                  <div className="space-y-1">
                    {match.bo3Games.map((game, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-gray-800/30 px-3 py-1"
                      >
                        <span className="text-gray-500">Juego {idx + 1}</span>
                        <span className="text-gray-300">
                          {game.playerAScore} - {game.playerBScore}
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

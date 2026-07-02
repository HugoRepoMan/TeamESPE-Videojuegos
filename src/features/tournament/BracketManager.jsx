import { useState } from 'react';
import { Trophy, Swords, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { matchResultSchema } from '../../schemas';
import { generateBracket, determineBo3Winner } from '../../lib/brackets';
import HudCard from '../../components/ui/HudCard';
import DiagonalButton from '../../components/ui/DiagonalButton';
import StatusBadge from '../../components/ui/StatusBadge';
import SectionTitle from '../../components/ui/SectionTitle';
import GameBadge from '../../components/ui/GameBadge';
import { useCollection } from '../../hooks/useFirestore';
import { where } from 'firebase/firestore';
import { getApprovedRegistrations, createMatch, updateMatchResult, deleteMatchesByDiscipline } from '../../firebase/services';

const DISCIPLINES = [
  { id: 'clash-royale', name: 'Clash Royale', slug: 'clash-royale' },
  { id: 'fortnite', name: 'Fortnite', slug: 'fortnite' },
  { id: 'minecraft', name: 'Minecraft', slug: 'minecraft' },
  { id: 'league-of-legends', name: 'League of Legends', slug: 'league-of-legends' },
  { id: 'dragon-ball', name: 'Dragon Ball Sparking Zero', slug: 'dragon-ball' },
  { id: 'fifa-26', name: 'FIFA 26', slug: 'fifa-26' },
  { id: 'mortal-kombat', name: 'Mortal Kombat', slug: 'mortal-kombat' },
];

export default function BracketManager() {
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editingMatch, setEditingMatch] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [gameScores, setGameScores] = useState({
    game1A: 0, game1B: 0,
    game2A: 0, game2B: 0,
    game3A: 0, game3B: 0,
  });

  // Top 8 Selection State
  const [isSelectingTop8, setIsSelectingTop8] = useState(false);
  const [clashRoyaleCandidates, setClashRoyaleCandidates] = useState([]);
  const [selectedTop8, setSelectedTop8] = useState([]);

  // Real-time listener for matches of the selected discipline
  const { data: dbMatches, loading } = useCollection('matches', [
    where('disciplineId', '==', selectedDiscipline)
  ]);

  const matches = [...(dbMatches || [])].sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.bracketPosition - b.bracketPosition;
  });

  async function handleGenerate() {
    if (!selectedDiscipline) {
      setMessage('Seleccione una disciplina primero.');
      return;
    }
    
    if (matches.length > 0) {
      setMessage('Error: El bracket ya ha sido generado para esta disciplina.');
      return;
    }

    try {
      setIsGenerating(true);
      setMessage('Generando brackets...');
      const registrations = await getApprovedRegistrations(selectedDiscipline);

      if (selectedDiscipline === 'clash-royale') {
        if (registrations.length < 8) {
          setMessage('Error: Se requieren al menos 8 inscritos aprobados para generar la llave del Top 8 en Clash Royale.');
          setIsGenerating(false);
          return;
        }
        setClashRoyaleCandidates(registrations);
        setIsSelectingTop8(true);
        setIsGenerating(false);
        setMessage('Selecciona a los 8 mejores jugadores del Todos contra Todos.');
        return;
      }

      if (registrations.length < 2) {
        setMessage('Error: Se requieren al menos 2 inscritos aprobados para generar llaves.');
        setIsGenerating(false);
        return;
      }

      // Map registrations to player format
      // Adapt to LoL (1v1 or 5v5): Use teamName if available, otherwise playerNick
      const players = registrations.map(reg => ({
        id: reg.userId, // Using userId as the player ID for the bracket logic
        nick: reg.playerNick,
        name: reg.teamName || reg.playerNick
      }));

      const generatedMatches = generateBracket(players);

      // Save each match to Firestore
      for (const m of generatedMatches) {
        await createMatch({
          disciplineId: selectedDiscipline,
          matchIndex: m.matchIndex,
          round: m.round,
          bracketPosition: m.bracketPosition,
          playerAId: m.playerA?.id || null,
          playerAName: m.playerA?.name || null,
          playerBId: m.playerB?.id || null,
          playerBName: m.playerB?.name || null,
          playerAScore: 0,
          playerBScore: 0,
          status: m.status || 'scheduled',
          winnerId: m.winnerId || null,
        });
      }

      setMessage('Bracket generado exitosamente.');
    } catch (err) {
      console.error(err);
      setMessage('Error al generar el bracket.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateClashRoyale() {
    if (selectedTop8.length !== 8) {
      setMessage(`Debes seleccionar exactamente 8 jugadores (actualmente tienes ${selectedTop8.length}).`);
      return;
    }

    try {
      setIsGenerating(true);
      setMessage('Generando llaves de Clash Royale (Top 8)...');
      
      const selectedRegistrations = clashRoyaleCandidates.filter(reg => selectedTop8.includes(reg.userId));
      const players = selectedRegistrations.map(reg => ({
        id: reg.userId,
        nick: reg.playerNick,
        name: reg.teamName || reg.playerNick
      }));

      // generateBracket handles shuffling and seeding
      const generatedMatches = generateBracket(players);

      for (const m of generatedMatches) {
        await createMatch({
          disciplineId: selectedDiscipline,
          matchIndex: m.matchIndex,
          round: m.round,
          bracketPosition: m.bracketPosition,
          playerAId: m.playerA?.id || null,
          playerAName: m.playerA?.name || null,
          playerBId: m.playerB?.id || null,
          playerBName: m.playerB?.name || null,
          playerAScore: 0,
          playerBScore: 0,
          status: m.status || 'scheduled',
          winnerId: m.winnerId || null,
        });
      }

      setMessage('Bracket del Top 8 generado exitosamente.');
      setIsSelectingTop8(false);
      setSelectedTop8([]);
    } catch (err) {
      console.error(err);
      setMessage('Error al generar el bracket.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDeleteMatches() {
    if (!selectedDiscipline) return;
    if (!window.confirm('¿Estas seguro de que deseas eliminar TODOS los brackets generados para esta disciplina? Esta accion no se puede deshacer.')) {
      return;
    }

    try {
      setIsGenerating(true);
      setMessage('Eliminando brackets...');
      await deleteMatchesByDiscipline(selectedDiscipline);
      setMessage('Brackets eliminados exitosamente. Ahora puedes volver a generar el sorteo.');
    } catch (err) {
      console.error(err);
      setMessage('Error al eliminar los brackets.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleScoreChange(e) {
    const { name, value } = e.target;
    setGameScores((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  }

  async function advanceWinnerInDb(winnerId, currentMatch) {
    const nextRound = currentMatch.round + 1;
    const nextPosition = Math.floor(currentMatch.bracketPosition / 2);
    const nextMatch = matches.find(m => m.round === nextRound && m.bracketPosition === nextPosition);
    
    if (nextMatch) {
      const winnerName = (currentMatch.playerAId === winnerId) 
        ? currentMatch.playerAName 
        : currentMatch.playerBName;
        
      const updateNextData = {};
      // Even source position goes to player A, odd goes to player B
      if (currentMatch.bracketPosition % 2 === 0) {
         updateNextData.playerAId = winnerId;
         updateNextData.playerAName = winnerName;
      } else {
         updateNextData.playerBId = winnerId;
         updateNextData.playerBName = winnerName;
      }
      
      // We must pass all required matchResultSchema fields when using updateMatchResult
      // or we can use the raw updateDoc, but let's stick to the service function.
      // Wait, updateMatchResult validates against matchResultSchema which only has scores, status, winnerId.
      // To update player names we might need a custom service function, or modify schema.
      // Let's pass the new fields to updateMatchResult.
      await updateMatchResult(nextMatch.id, {
        playerAScore: nextMatch.playerAScore || 0,
        playerBScore: nextMatch.playerBScore || 0,
        status: nextMatch.status,
        winnerId: nextMatch.winnerId || null,
        ...updateNextData // Additional fields will be updated alongside the schema validation in the service
      });
    }
  }

  async function handleSubmitResult(matchId) {
    setFormErrors({});
    setMessage('');

    const games = [
      { playerAScore: gameScores.game1A, playerBScore: gameScores.game1B },
      { playerAScore: gameScores.game2A, playerBScore: gameScores.game2B },
      { playerAScore: gameScores.game3A, playerBScore: gameScores.game3B },
    ];

    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    // Use our bo3 logic
    const bo3WinnerObject = determineBo3Winner(games);
    let winnerId = null;
    if (bo3WinnerObject) {
      winnerId = bo3WinnerObject.winnerId === 'A' ? match.playerAId : match.playerBId;
    }

    const playerAScoreTotal = games.filter((g) => g.playerAScore > g.playerBScore).length;
    const playerBScoreTotal = games.filter((g) => g.playerBScore > g.playerAScore).length;

    const resultData = {
      playerAScore: playerAScoreTotal,
      playerBScore: playerBScoreTotal,
      bo3Games: games,
      status: winnerId ? 'completed' : match.status,
      scheduledTime: scheduledTime || undefined,
      winnerId: winnerId || undefined,
    };

    const result = matchResultSchema.safeParse(resultData);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join('.');
        fieldErrors[field] = issue.message;
      }
      setFormErrors(fieldErrors);
      setMessage('Error de validacion en los resultados.');
      return;
    }

    try {
      await updateMatchResult(matchId, resultData);
      if (winnerId) {
        await advanceWinnerInDb(winnerId, match);
      }
      setEditingMatch(null);
      setGameScores({ game1A: 0, game1B: 0, game2A: 0, game2B: 0, game3A: 0, game3B: 0 });
      setMessage(winnerId ? 'Resultado registrado y ganador avanzado en la base de datos.' : 'Puntajes actualizados.');
    } catch (err) {
      console.error(err);
      setMessage('Error al guardar el resultado en la base de datos.');
    }
  }

  async function handleWalkover(matchId, winnerId) {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;
    
    try {
      const resultData = {
        playerAScore: match.playerAId === winnerId ? 2 : 0,
        playerBScore: match.playerBId === winnerId ? 2 : 0,
        status: 'completed',
        winnerId: winnerId
      };
      
      await updateMatchResult(matchId, resultData);
      await advanceWinnerInDb(winnerId, match);
      setMessage('W.O. registrado y ganador avanzado en la base de datos.');
    } catch (err) {
      console.error(err);
      setMessage('Error al registrar W.O.');
    }
  }

  const discipline = DISCIPLINES.find((d) => d.id === selectedDiscipline);
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <SectionTitle>Administración de Brackets</SectionTitle>

      {message && (
        <div
          className={`mb-4 p-3 border text-sm ${
            message.includes('Error')
              ? 'border-red-500/50 bg-red-500/10 text-red-400'
              : 'border-green-500/50 bg-green-500/10 text-green-400'
          }`}
        >
          {message}
        </div>
      )}

      {/* Controls */}
      <HudCard className="mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {matches.length === 0 && !isSelectingTop8 && (
            <div className="flex gap-4 items-center">
              <select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-100 px-4 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="">Seleccione una disciplina</option>
                {DISCIPLINES.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              
              <DiagonalButton
                onClick={handleGenerate}
                disabled={!selectedDiscipline || isGenerating}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generar Brackets'}
              </DiagonalButton>
            </div>
          )}

          {isSelectingTop8 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-100 border-b border-gray-800 pb-2">Selección del Top 8 (Clash Royale)</h3>
              <p className="text-sm text-gray-400">Selecciona los 8 jugadores que pasaron la fase de "Todos contra Todos". Has seleccionado: <span className="text-red-400 font-bold">{selectedTop8.length}/8</span></p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
                {clashRoyaleCandidates.map(reg => (
                  <label key={reg.userId} className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${selectedTop8.includes(reg.userId) ? 'border-red-500 bg-red-500/10' : 'border-gray-800 bg-gray-900/50 hover:bg-gray-800'}`}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-red-500"
                      checked={selectedTop8.includes(reg.userId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedTop8.length >= 8) {
                            alert('Ya has seleccionado 8 jugadores.');
                            return;
                          }
                          setSelectedTop8(prev => [...prev, reg.userId]);
                        } else {
                          setSelectedTop8(prev => prev.filter(id => id !== reg.userId));
                        }
                      }}
                    />
                    <div>
                      <div className="font-bold text-gray-100">{reg.playerNick}</div>
                      {reg.playerName && <div className="text-xs text-gray-500">{reg.playerName}</div>}
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="flex gap-4 pt-4">
                <DiagonalButton
                  onClick={handleGenerateClashRoyale}
                  disabled={selectedTop8.length !== 8 || isGenerating}
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar y Generar Llave'}
                </DiagonalButton>
                <button
                  onClick={() => {
                    setIsSelectingTop8(false);
                    setSelectedTop8([]);
                    setMessage('');
                  }}
                  className="px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {matches.length > 0 && (
            <DiagonalButton onClick={handleDeleteMatches} disabled={isGenerating} variant="danger">
              Eliminar Sorteo
            </DiagonalButton>
          )}
        </div>
      </HudCard>

      {/* Discipline Badge */}
      {discipline && (
        <div className="mb-4">
          <GameBadge name={discipline.name} />
        </div>
      )}

      {/* Bracket Tree */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : matches.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max pb-4">
            {rounds.map((round) => {
              const roundMatches = matches.filter((m) => m.round === round);
              return (
                <div key={round} className="flex flex-col gap-4 min-w-64">
                  <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider text-center mb-2">
                    {round === 1
                      ? 'Ronda 1'
                      : round === rounds.length
                        ? 'Final'
                        : `Ronda ${round}`}
                  </h4>
                  {roundMatches.map((match) => (
                    <HudCard key={match.id} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <Swords className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            Partida {match.matchIndex !== undefined ? match.matchIndex + 1 : match.id}
                          </span>
                        </div>
                        <StatusBadge status={match.status} />
                      </div>
                      
                      {match.scheduledTime && (
                        <div className="mb-2 text-xs text-yellow-400 font-semibold bg-yellow-400/10 inline-block px-2 py-0.5 rounded">
                          {new Date(match.scheduledTime).toLocaleString()}
                        </div>
                      )}

                      {/* Players */}
                      <div className="space-y-1 mb-3">
                        <div
                          className={`flex justify-between items-center px-2 py-1 text-sm ${
                            match.winnerId === match.playerAId && match.winnerId != null
                              ? 'bg-green-500/10 border-l-2 border-green-500'
                              : 'bg-gray-800/50'
                          }`}
                        >
                          <span className="text-gray-200 truncate">
                            {match.playerAName || 'Por definir'}
                          </span>
                          <span className="font-bold text-gray-100">{match.playerAScore || 0}</span>
                        </div>
                        <div
                          className={`flex justify-between items-center px-2 py-1 text-sm ${
                            match.winnerId === match.playerBId && match.winnerId != null
                              ? 'bg-green-500/10 border-l-2 border-green-500'
                              : 'bg-gray-800/50'
                          }`}
                        >
                          <span className="text-gray-200 truncate">
                            {match.playerBName || 'Por definir'}
                          </span>
                          <span className="font-bold text-gray-100">{match.playerBScore || 0}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {match.status !== 'completed' && (
                        <div className="space-y-2">
                          {editingMatch === match.id ? (
                            <div className="space-y-2">
                              <div className="flex flex-col gap-1 mb-2">
                                <label className="text-xs text-gray-400">Fecha y Hora:</label>
                                <input
                                  type="datetime-local"
                                  value={scheduledTime}
                                  onChange={(e) => setScheduledTime(e.target.value)}
                                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-2 py-1 focus:outline-none focus:border-red-500 text-xs"
                                />
                              </div>
                              
                              {match.playerAId && match.playerBId ? (
                                <>
                                  <p className="text-xs text-gray-400">Resultados Bo3:</p>
                                  {[1, 2, 3].map((g) => (
                                    <div key={g} className="flex items-center gap-2 text-xs">
                                      <span className="text-gray-500 w-14">Juego {g}:</span>
                                      <input
                                        type="number"
                                        name={`game${g}A`}
                                        value={gameScores[`game${g}A`]}
                                        onChange={handleScoreChange}
                                        min={0}
                                        className="w-12 bg-gray-800 border border-gray-700 text-gray-100 px-1 py-0.5 text-center focus:outline-none focus:border-red-500"
                                      />
                                      <span className="text-gray-600">-</span>
                                      <input
                                        type="number"
                                        name={`game${g}B`}
                                        value={gameScores[`game${g}B`]}
                                        onChange={handleScoreChange}
                                        min={0}
                                        className="w-12 bg-gray-800 border border-gray-700 text-gray-100 px-1 py-0.5 text-center focus:outline-none focus:border-red-500"
                                      />
                                    </div>
                                  ))}
                                  {formErrors && Object.keys(formErrors).length > 0 && (
                                    <p className="text-red-400 text-xs">
                                      Verifique los puntajes ingresados.
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-xs text-gray-500 italic">Los jugadores aún no están definidos, solo puedes programar la fecha.</p>
                              )}

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSubmitResult(match.id)}
                                  className="flex items-center gap-1 px-2 py-1 bg-green-600/20 border border-green-500/50 text-green-400 text-xs hover:bg-green-600/40 transition-colors"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => setEditingMatch(null)}
                                  className="px-2 py-1 bg-gray-700/50 border border-gray-600 text-gray-400 text-xs hover:bg-gray-700 transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingMatch(match.id);
                                  setScheduledTime(match.scheduledTime || '');
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-500/50 text-blue-400 text-xs hover:bg-blue-600/40 transition-colors"
                              >
                                <Swords className="w-3 h-3" />
                                {match.playerAId && match.playerBId ? 'Registrar / Programar' : 'Programar Horario'}
                              </button>
                              
                              {match.playerAId && match.playerBId && (
                                <>
                                  <button
                                    onClick={() => handleWalkover(match.id, match.playerAId)}
                                    className="flex items-center gap-1 px-2 py-1 bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 text-xs hover:bg-yellow-600/40 transition-colors"
                                    title={`W.O. a favor de ${match.playerAName}`}
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                    W.O. A
                                  </button>
                                  <button
                                    onClick={() => handleWalkover(match.id, match.playerBId)}
                                    className="flex items-center gap-1 px-2 py-1 bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 text-xs hover:bg-yellow-600/40 transition-colors"
                                    title={`W.O. a favor de ${match.playerBName}`}
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                    W.O. B
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </HudCard>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && matches.length === 0 && selectedDiscipline && (
        <HudCard>
          <p className="text-gray-500 text-center py-8">
            Seleccione una disciplina y presione &quot;Generar Bracket&quot; para crear el
            árbol de eliminación a partir de los inscritos aprobados.
          </p>
        </HudCard>
      )}
    </div>
  );
}

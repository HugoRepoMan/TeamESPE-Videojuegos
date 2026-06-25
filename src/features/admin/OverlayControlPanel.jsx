import { useState } from 'react';
import { Tv, Save, Eye } from 'lucide-react';
import { overlayUpdateSchema } from '../../schemas';
import { updateOverlay } from '../../firebase/services';
import HudCard from '../../components/ui/HudCard';
import DiagonalButton from '../../components/ui/DiagonalButton';
import SectionTitle from '../../components/ui/SectionTitle';

const SEED_MATCHES = [
  { id: 'match-1', label: 'Clash Royale - JuanGamer vs MariaFury' },
  { id: 'match-2', label: 'League of Legends - Team Alpha vs Team Beta' },
  { id: 'match-3', label: 'FIFA 26 - CarlosX vs LuisK' },
  { id: 'match-4', label: 'Mortal Kombat - AnaStrike vs ElenaGG' },
];

export default function OverlayControlPanel() {
  const [selectedMatch, setSelectedMatch] = useState('');
  const [overlayData, setOverlayData] = useState({
    disciplineName: '',
    playerAName: '',
    playerBName: '',
    playerAScore: 0,
    playerBScore: 0,
    status: 'scheduled',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setOverlayData((prev) => ({
      ...prev,
      [name]: name.includes('Score') ? parseInt(value, 10) || 0 : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleMatchSelect(e) {
    const matchId = e.target.value;
    setSelectedMatch(matchId);
    const match = SEED_MATCHES.find((m) => m.id === matchId);
    if (match) {
      const parts = match.label.split(' - ');
      const discipline = parts[0] || '';
      const playerParts = (parts[1] || '').split(' vs ');
      setOverlayData({
        disciplineName: discipline,
        playerAName: playerParts[0]?.trim() || '',
        playerBName: playerParts[1]?.trim() || '',
        playerAScore: 0,
        playerBScore: 0,
        status: 'live',
      });
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormErrors({});
    setMessage('');

    const dataToValidate = {
      activeMatchId: selectedMatch || 'manual',
      ...overlayData,
    };

    const result = overlayUpdateSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        fieldErrors[field] = issue.message;
      }
      setFormErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      await updateOverlay(result.data);
      setMessage('Overlay actualizado correctamente.');
    } catch {
      setMessage('Error al actualizar el overlay.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <SectionTitle>Control de Overlay</SectionTitle>
      <p className="text-gray-400 mb-6">
        Controla la informacion que se muestra en el overlay de transmision en vivo.
      </p>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Control Form */}
        <HudCard>
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            Configuracion del Overlay
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Partida Activa</label>
              <select
                value={selectedMatch}
                onChange={handleMatchSelect}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="">Seleccionar partida</option>
                {SEED_MATCHES.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Disciplina</label>
              <input
                type="text"
                name="disciplineName"
                value={overlayData.disciplineName}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500"
                placeholder="Nombre de la disciplina"
              />
              {formErrors.disciplineName && (
                <p className="text-red-400 text-xs mt-1">{formErrors.disciplineName}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Jugador / Equipo A</label>
                <input
                  type="text"
                  name="playerAName"
                  value={overlayData.playerAName}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500"
                />
                {formErrors.playerAName && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.playerAName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Jugador / Equipo B</label>
                <input
                  type="text"
                  name="playerBName"
                  value={overlayData.playerBName}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500"
                />
                {formErrors.playerBName && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.playerBName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Puntaje A</label>
                <input
                  type="number"
                  name="playerAScore"
                  value={overlayData.playerAScore}
                  onChange={handleChange}
                  min={0}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500"
                />
                {formErrors.playerAScore && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.playerAScore}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Puntaje B</label>
                <input
                  type="number"
                  name="playerBScore"
                  value={overlayData.playerBScore}
                  onChange={handleChange}
                  min={0}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500"
                />
                {formErrors.playerBScore && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.playerBScore}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Estado</label>
              <select
                name="status"
                value={overlayData.status}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="scheduled">Programada</option>
                <option value="live">En Vivo</option>
                <option value="completed">Completada</option>
                <option value="paused">Pausada</option>
              </select>
            </div>
            <DiagonalButton type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar en Overlay'}
            </DiagonalButton>
          </form>
        </HudCard>

        {/* Preview */}
        <HudCard>
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-red-500" />
            Vista Previa del Overlay
          </h3>
          <div className="bg-black border-2 border-red-500/30 p-6 relative overflow-hidden">
            {/* HUD Frame Lines */}
            <div className="absolute top-0 left-0 w-16 h-0.5 bg-red-500" />
            <div className="absolute top-0 left-0 w-0.5 h-16 bg-red-500" />
            <div className="absolute bottom-0 right-0 w-16 h-0.5 bg-red-500" />
            <div className="absolute bottom-0 right-0 w-0.5 h-16 bg-red-500" />

            {/* Discipline */}
            <p className="text-center text-xs text-red-400 uppercase tracking-widest mb-4">
              {overlayData.disciplineName || 'DISCIPLINA'}
            </p>

            {/* Match Display */}
            <div className="flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-lg font-bold text-gray-100 truncate">
                  {overlayData.playerAName || 'Jugador A'}
                </p>
              </div>
              <div className="flex items-center gap-3 px-4">
                <span className="text-3xl font-black text-gray-100">
                  {overlayData.playerAScore}
                </span>
                <span className="text-gray-600 text-sm">VS</span>
                <span className="text-3xl font-black text-gray-100">
                  {overlayData.playerBScore}
                </span>
              </div>
              <div className="flex-1 text-center">
                <p className="text-lg font-bold text-gray-100 truncate">
                  {overlayData.playerBName || 'Jugador B'}
                </p>
              </div>
            </div>

            {/* Status */}
            <p className="text-center text-xs text-gray-500 uppercase tracking-wider mt-4">
              {overlayData.status === 'live' ? 'EN VIVO' : overlayData.status.toUpperCase()}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Esta es una vista previa reducida. El overlay real se muestra en
            resolucion 1920x1080 en /overlay/live.
          </p>
        </HudCard>
      </div>
    </div>
  );
}

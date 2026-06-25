import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { Gamepad2, CreditCard, Info } from 'lucide-react';
import { db } from '../../firebase/client';
import { useAuth } from '../auth/useAuth';
import { registrationSchema } from '../../schemas';
import HudCard from '../../components/ui/HudCard';
import StatusBadge from '../../components/ui/StatusBadge';
import DiagonalButton from '../../components/ui/DiagonalButton';
import SectionTitle from '../../components/ui/SectionTitle';

const DISCIPLINES = [
  { id: 'clash-royale', name: 'Clash Royale', mode: '1v1', active: true },
  { id: 'fortnite', name: 'Fortnite', mode: 'Solo', active: true },
  { id: 'minecraft', name: 'Minecraft', mode: 'Equipo', active: true },
  { id: 'league-of-legends', name: 'League of Legends', mode: '5v5', active: true },
  { id: 'dragon-ball', name: 'Dragon Ball Sparking Zero', mode: '1v1', active: true },
  { id: 'fifa-26', name: 'FIFA 26', mode: '1v1', active: true },
  { id: 'mortal-kombat', name: 'Mortal Kombat', mode: '1v1', active: true },
];

const COST_PER_DISCIPLINE = 2.0;

const SEED_REGISTRATIONS = [
  {
    id: 'reg1',
    disciplineId: 'clash-royale',
    disciplineName: 'Clash Royale',
    paymentStatus: 'approved',
    amount: 2,
    createdAt: '2025-07-01',
  },
  {
    id: 'reg2',
    disciplineId: 'fortnite',
    disciplineName: 'Fortnite',
    paymentStatus: 'pending',
    amount: 2,
    createdAt: '2025-07-02',
  },
];

export default function RegistrationsPanel() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState(SEED_REGISTRATIONS);
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [playerNick, setPlayerNick] = useState('');
  const [teamName, setTeamName] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  async function handleRegister(e) {
    e.preventDefault();
    setFormErrors({});
    setSubmitMessage('');

    const discipline = DISCIPLINES.find((d) => d.id === selectedDiscipline);

    const formData = {
      userId: user?.uid || '',
      disciplineId: selectedDiscipline,
      playerNick: playerNick.trim(),
      teamName: teamName.trim(),
      amount: COST_PER_DISCIPLINE,
      paymentStatus: 'pending',
      paymentReference: '',
    };

    const result = registrationSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        fieldErrors[field] = issue.message;
      }
      setFormErrors(fieldErrors);
      return;
    }

    const alreadyRegistered = registrations.some(
      (r) => r.disciplineId === selectedDiscipline
    );
    if (alreadyRegistered) {
      setSubmitMessage('Ya estas inscrito en esta disciplina.');
      return;
    }

    setSubmitting(true);
    try {
      const docData = {
        ...result.data,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'registrations'), docData);

      const newReg = {
        id: `reg-${Date.now()}`,
        disciplineId: selectedDiscipline,
        disciplineName: discipline?.name || selectedDiscipline,
        paymentStatus: 'pending',
        amount: COST_PER_DISCIPLINE,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRegistrations((prev) => [...prev, newReg]);
      setSelectedDiscipline('');
      setPlayerNick('');
      setTeamName('');
      setShowPaymentInfo(true);
      setSubmitMessage('Inscripcion registrada exitosamente.');
    } catch {
      setSubmitMessage('Error al registrar la inscripcion. Intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <SectionTitle>Mis Inscripciones</SectionTitle>

      {/* Submit Message */}
      {submitMessage && (
        <div
          className={`mb-4 p-3 border text-sm ${
            submitMessage.includes('Error') || submitMessage.includes('Ya estas')
              ? 'border-red-500/50 bg-red-500/10 text-red-400'
              : 'border-green-500/50 bg-green-500/10 text-green-400'
          }`}
        >
          {submitMessage}
        </div>
      )}

      {/* Current Registrations */}
      <HudCard className="mb-8">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-red-500" />
          Inscripciones Actuales
        </h3>
        {registrations.length === 0 ? (
          <p className="text-gray-500">No tienes inscripciones registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="pb-2 pr-4">Disciplina</th>
                  <th className="pb-2 pr-4">Monto</th>
                  <th className="pb-2 pr-4">Estado</th>
                  <th className="pb-2">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-gray-800">
                    <td className="py-3 pr-4 text-gray-200">{reg.disciplineName}</td>
                    <td className="py-3 pr-4 text-gray-300">${reg.amount.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={reg.paymentStatus} />
                    </td>
                    <td className="py-3 text-gray-400">{reg.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HudCard>

      {/* New Registration Form */}
      <HudCard className="mb-8">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-red-500" />
          Nueva Inscripcion
        </h3>
        <form onSubmit={handleRegister} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Disciplina</label>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="">Seleccionar disciplina</option>
              {DISCIPLINES.filter((d) => d.active).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.mode})
                </option>
              ))}
            </select>
            {formErrors.disciplineId && (
              <p className="text-red-400 text-xs mt-1">{formErrors.disciplineId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nick de Jugador</label>
            <input
              type="text"
              value={playerNick}
              onChange={(e) => setPlayerNick(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Tu nick en el juego"
            />
            {formErrors.playerNick && (
              <p className="text-red-400 text-xs mt-1">{formErrors.playerNick}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Nombre del Equipo (opcional)
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Nombre del equipo"
            />
          </div>
          <div className="bg-gray-800/50 border border-gray-700 p-3">
            <p className="text-sm text-gray-300">
              Costo por disciplina: <span className="text-red-400 font-bold">${COST_PER_DISCIPLINE.toFixed(2)}</span>
            </p>
          </div>
          <DiagonalButton type="submit" disabled={submitting}>
            {submitting ? 'Registrando...' : 'Inscribirse'}
          </DiagonalButton>
        </form>
      </HudCard>

      {/* Payment Instructions */}
      {showPaymentInfo && (
        <HudCard>
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-yellow-500" />
            Instrucciones de Pago
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              Consulte las instrucciones de pago en la seccion de su dashboard.
            </p>
            <p>
              Una vez realizado el pago, su inscripcion sera revisada y aprobada
              por un administrador.
            </p>
            <p className="text-gray-500">
              El estado de su pago cambiara de &quot;pendiente&quot; a
              &quot;aprobado&quot; una vez verificado.
            </p>
          </div>
        </HudCard>
      )}
    </div>
  );
}

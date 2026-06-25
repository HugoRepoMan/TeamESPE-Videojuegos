import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { Gamepad2, CreditCard, Info, UploadCloud } from 'lucide-react';
import { db } from '../../firebase/client';
import { uploadPaymentReceipt } from '../../firebase/services';
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

export default function RegistrationsPanel() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [playerNick, setPlayerNick] = useState('');
  const [teamName, setTeamName] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'registrations'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Format the date for the table. It might be a Timestamp.
        createdAt: doc.data().createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      }));
      setRegistrations(data);
    });
    return () => unsubscribe();
  }, [user]);

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
      disciplineName: discipline?.name || selectedDiscipline,
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
    
    if (!receiptFile) {
      setFormErrors({ ...formErrors, receiptFile: "Por favor, adjunte su comprobante de pago." });
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
      // 1. Upload receipt to storage
      const receiptUrl = await uploadPaymentReceipt(receiptFile, user.uid);
      
      // 2. Save registration doc
      const docData = {
        ...result.data,
        paymentReceiptUrl: receiptUrl,
        createdAt: new Date(), // using local date because serverTimestamp() makes it hard to parse immediately locally if needed
        disciplineName: discipline?.name || selectedDiscipline,
      };
      
      await addDoc(collection(db, 'registrations'), docData);

      setSelectedDiscipline('');
      setPlayerNick('');
      setTeamName('');
      setReceiptFile(null);
      setShowPaymentInfo(true);
      setSubmitMessage('Inscripcion registrada exitosamente.');
    } catch (error) {
      console.error(error);
      setSubmitMessage('Error al registrar la inscripcion. Intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
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
                    <td className="py-3 pr-4 text-gray-300">${(reg.amount || 0).toFixed(2)}</td>
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
          <div className="bg-gray-800/50 border border-gray-700 p-4 space-y-4">
            <p className="text-sm text-gray-300">
              Costo por disciplina: <span className="text-red-400 font-bold">${COST_PER_DISCIPLINE.toFixed(2)}</span>
            </p>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-shrink-0 bg-white p-2 rounded w-40 h-40 flex items-center justify-center border border-dashed border-gray-500 text-center">
                <img src="/qr-pago.png" alt="Sube tu imagen qr-pago.png en public/" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-400">
                  Escanea el codigo QR para realizar el pago o deposita directamente en la cuenta. Luego, adjunta el comprobante aqui:
                </p>
                <label className="flex items-center gap-2 cursor-pointer border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-300 hover:border-red-500 transition-colors w-full">
                  <UploadCloud size={16} className="text-red-500" />
                  <span className="truncate">{receiptFile ? receiptFile.name : "Subir comprobante (Imagen/PDF)"}</span>
                  <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                </label>
                {formErrors.receiptFile && (
                  <p className="text-red-400 text-xs mt-1">{formErrors.receiptFile}</p>
                )}
              </div>
            </div>
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

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  
  const deadline = new Date('2026-07-16T12:00:00-05:00');
  const isClosed = new Date() > deadline;

  const [registrations, setRegistrations] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [playerNick, setPlayerNick] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState(['', '', '', '']);
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
    try {
      setFormErrors({});
      setSubmitMessage('');

      const discipline = DISCIPLINES.find((d) => d.id === selectedDiscipline);
      const isLol = selectedDiscipline === 'league-of-legends';

      const formData = {
        disciplineId: selectedDiscipline,
        playerNick: playerNick.trim(),
        teamName: teamName.trim(),
        ...(isLol && { teamMembers: teamMembers.map(m => m.trim()) })
      };

      const result = registrationSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0];
          fieldErrors[field] = issue.message;
        }
        setFormErrors(fieldErrors);
        setSubmitMessage('Por favor, corrige los errores en rojo antes de continuar.');
        return;
      }

      if (!receiptFile) {
        setFormErrors({ receiptFile: 'Por favor, adjunte su comprobante de pago.' });
        setSubmitMessage('Por favor, adjunte su comprobante de pago.');
        return;
      }

      // Validate file type client-side (defense-in-depth; Storage rules also validate)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(receiptFile.type)) {
        setFormErrors({ receiptFile: 'Solo se permiten imágenes (JPG, PNG, GIF, WEBP) o PDF.' });
        setSubmitMessage('Tipo de archivo no permitido.');
        return;
      }
      const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
      if (receiptFile.size > MAX_SIZE) {
        setFormErrors({ receiptFile: 'El archivo no puede superar los 5 MB.' });
        setSubmitMessage('El archivo es demasiado grande.');
        return;
      }

      // Use a deterministic document ID to prevent duplicate registrations at the DB level.
      // Even if the client-side check is bypassed, Firestore will reject a second setDoc
      // with the same ID (or overwrite, which is also safe since we keep paymentStatus: pending).
      const registrationDocId = `${user.uid}_${selectedDiscipline}`;
      const alreadyRegistered = registrations.some(
        (r) => r.disciplineId === selectedDiscipline
      );
      if (alreadyRegistered) {
        setSubmitMessage('Ya estás inscrito en esta disciplina.');
        return;
      }

      setSubmitting(true);

      // 1. Upload receipt to storage
      const receiptUrl = await uploadPaymentReceipt(receiptFile, user.uid);

      // 2. Save registration using a deterministic ID to prevent duplicates
      const docData = {
        ...result.data,
        userId: user.uid,
        amount: isLol ? 10.0 : COST_PER_DISCIPLINE,
        paymentStatus: 'pending',
        paymentReceiptUrl: receiptUrl,
        disciplineName: discipline?.name || selectedDiscipline,
        playerName: user?.displayName || user?.email || 'Jugador',
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'registrations', registrationDocId), docData);

      setSelectedDiscipline('');
      setPlayerNick('');
      setTeamName('');
      setTeamMembers(['', '', '', '']);
      setReceiptFile(null);
      setShowPaymentInfo(true);
      setSubmitMessage('Inscripcion registrada exitosamente.');
    } catch (error) {
      console.error(error);
      setSubmitMessage('Error al procesar tu inscripción. Inténtalo de nuevo.');
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
    <div className="space-y-6">
      <SectionTitle>Mis Inscripciones</SectionTitle>

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

      {/* Registration Deadline Notice */}
      <div className={`p-4 border flex items-start gap-3 ${isClosed ? 'bg-red-950/50 border-red-500/30' : 'bg-yellow-950/30 border-yellow-500/30'}`}>
        <Info className={`w-6 h-6 mt-1 shrink-0 ${isClosed ? 'text-red-400' : 'text-yellow-500'}`} />
        <div>
          <h3 className={`font-semibold ${isClosed ? 'text-red-400' : 'text-yellow-500'}`}>
            {isClosed ? 'Inscripciones Cerradas' : 'Cierre de inscripciones'}
          </h3>
          <p className="text-gray-300 mt-1 text-sm leading-relaxed">
            {isClosed 
              ? 'El plazo para inscribirse ha finalizado el 16 de Julio de 2026 al medio día (12:00 PM).'
              : 'Las inscripciones solo se podrán realizar hasta el 16 de Julio de 2026 a las 12:00 PM (Medio Día).'
            }
          </p>
        </div>
      </div>

      {/* New Registration Form */}
      {!isClosed && (
      <HudCard className="mb-8">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-red-500" />
          Nueva Inscripcion
        </h3>
        
        {/* Submit Message */}
        {submitMessage && (
          <div
            className={`mb-4 p-3 border text-sm ${
              submitMessage.includes('Error') || submitMessage.includes('Ya estas') || submitMessage.includes('Por favor')
                ? 'border-red-500/50 bg-red-500/10 text-red-400'
                : 'border-green-500/50 bg-green-500/10 text-green-400'
            }`}
          >
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 max-w-xl">
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
              {selectedDiscipline === 'league-of-legends' ? 'Nombre del Equipo *' : 'Nombre del Equipo (opcional)'}
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Nombre del equipo"
            />
            {formErrors.teamName && (
              <p className="text-red-400 text-xs mt-1">{formErrors.teamName}</p>
            )}
          </div>
          {selectedDiscipline === 'league-of-legends' && (
            <div className="space-y-3">
              <label className="block text-sm text-gray-400 mb-1">Resto del Equipo (4 integrantes) *</label>
              {teamMembers.map((member, index) => (
                <input
                  key={index}
                  type="text"
                  value={member}
                  onChange={(e) => {
                    const newMembers = [...teamMembers];
                    newMembers[index] = e.target.value;
                    setTeamMembers(newMembers);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
                  placeholder={`Integrante ${index + 1}`}
                />
              ))}
              {formErrors.teamMembers && (
                <p className="text-red-400 text-xs mt-1">{formErrors.teamMembers}</p>
              )}
            </div>
          )}
          <div className="bg-gray-800/50 border border-gray-700 p-4 space-y-4 rounded-md">
            <p className="text-sm text-gray-300">
              Costo por disciplina: <span className="text-red-400 font-bold">${(selectedDiscipline === 'league-of-legends' ? 10.0 : COST_PER_DISCIPLINE).toFixed(2)}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0 bg-white p-2 rounded w-40 h-40 flex items-center justify-center border border-dashed border-gray-500 text-center mx-auto sm:mx-0">
                <img src="/qr-pago.png" alt="Sube tu imagen qr-pago.png en public/" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1 space-y-3 min-w-0 w-full">
                <div className="text-sm text-gray-400 space-y-1">
                  <p className="text-gray-200 font-semibold mb-2">Transferencia interbancaria:</p>
                  <p>Banco Pichincha</p>
                  <p>Cuenta de ahorro transaccional</p>
                  <p>Número: 2208241227</p>
                  <p>Nombre: Shadya Nicole Reyes Zambrano</p>
                  <p>CI: 0803702851</p>
                </div>
                <div className="text-xs text-yellow-500/90 bg-yellow-500/10 border border-yellow-500/20 p-2 rounded">
                  <p>Dudas o confirmaciones: <strong>+593 96 308 3389</strong></p>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-700/50">
              <p className="text-sm text-gray-300 mb-2">
                Escanea el código QR o deposita en la cuenta, y luego adjunta el comprobante aquí:
              </p>
              <label className="flex items-center gap-2 cursor-pointer border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-300 hover:border-red-500 transition-colors w-full rounded">
                <UploadCloud size={16} className="text-red-500 flex-shrink-0" />
                <span className="truncate">{receiptFile ? receiptFile.name : "Subir comprobante (Imagen/PDF)"}</span>
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
              </label>
              {formErrors.receiptFile && (
                <p className="text-red-400 text-xs mt-1">{formErrors.receiptFile}</p>
              )}
            </div>
          </div>
          <DiagonalButton type="submit" disabled={submitting}>
            {submitting ? 'Registrando...' : 'Inscribirse'}
          </DiagonalButton>
        </form>
      </HudCard>
      )}

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

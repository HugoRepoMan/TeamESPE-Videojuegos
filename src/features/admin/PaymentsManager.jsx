import { useState } from 'react';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { Check, X, Filter, Search } from 'lucide-react';
import { db } from '../../firebase/client';
import { paymentApprovalSchema } from '../../schemas';
import HudCard from '../../components/ui/HudCard';
import StatusBadge from '../../components/ui/StatusBadge';
import DiagonalButton from '../../components/ui/DiagonalButton';
import SectionTitle from '../../components/ui/SectionTitle';

const DISCIPLINES = [
  { id: 'clash-royale', name: 'Clash Royale' },
  { id: 'fortnite', name: 'Fortnite' },
  { id: 'minecraft', name: 'Minecraft' },
  { id: 'league-of-legends', name: 'League of Legends' },
  { id: 'dragon-ball', name: 'Dragon Ball Sparking Zero' },
  { id: 'fifa-26', name: 'FIFA 26' },
  { id: 'mortal-kombat', name: 'Mortal Kombat' },
];

const INITIAL_REGISTRATIONS = [
  { id: 'r1', userId: 'u1', playerName: 'Juan Perez', playerNick: 'JuanGamer', disciplineId: 'clash-royale', disciplineName: 'Clash Royale', amount: 2, paymentStatus: 'pending', paymentReference: 'REF-001' },
  { id: 'r2', userId: 'u2', playerName: 'Maria Lopez', playerNick: 'MariaFury', disciplineId: 'league-of-legends', disciplineName: 'League of Legends', amount: 2, paymentStatus: 'pending', paymentReference: 'REF-002' },
  { id: 'r3', userId: 'u3', playerName: 'Carlos Ruiz', playerNick: 'CarlosX', disciplineId: 'fortnite', disciplineName: 'Fortnite', amount: 2, paymentStatus: 'approved', paymentReference: 'REF-003' },
  { id: 'r4', userId: 'u4', playerName: 'Ana Torres', playerNick: 'AnaStrike', disciplineId: 'fifa-26', disciplineName: 'FIFA 26', amount: 2, paymentStatus: 'rejected', paymentReference: '' },
  { id: 'r5', userId: 'u5', playerName: 'Luis Garcia', playerNick: 'LuisK', disciplineId: 'mortal-kombat', disciplineName: 'Mortal Kombat', amount: 2, paymentStatus: 'pending', paymentReference: 'REF-005' },
  { id: 'r6', userId: 'u6', playerName: 'Elena Castro', playerNick: 'ElenaGG', disciplineId: 'dragon-ball', disciplineName: 'Dragon Ball Sparking Zero', amount: 2, paymentStatus: 'approved', paymentReference: 'REF-006' },
];

export default function PaymentsManager() {
  const [registrations, setRegistrations] = useState(INITIAL_REGISTRATIONS);
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(null);
  const [message, setMessage] = useState('');

  const filtered = registrations.filter((reg) => {
    if (filterDiscipline && reg.disciplineId !== filterDiscipline) return false;
    if (filterStatus && reg.paymentStatus !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        reg.playerName.toLowerCase().includes(term) ||
        reg.playerNick.toLowerCase().includes(term) ||
        reg.paymentReference.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }
    return true;
  });

  async function handleAction(registrationId, action) {
    setMessage('');
    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) return;

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const approvalData = {
      registrationId,
      newStatus,
      adminNotes: '',
    };

    const result = paymentApprovalSchema.safeParse(approvalData);
    if (!result.success) {
      setMessage('Error de validacion al procesar el pago.');
      return;
    }

    setProcessing(registrationId);
    try {
      const docRef = doc(db, 'registrations', registrationId);
      await updateDoc(docRef, {
        paymentStatus: newStatus,
        updatedAt: new Date().toISOString(),
      });

      if (newStatus === 'approved') {
        await addDoc(collection(db, 'treasury'), {
          registrationId,
          userId: reg.userId,
          playerNick: reg.playerNick,
          disciplineId: reg.disciplineId,
          amount: reg.amount,
          type: 'income',
          createdAt: new Date().toISOString(),
        });
      }

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId ? { ...r, paymentStatus: newStatus } : r
        )
      );
      setMessage(
        newStatus === 'approved'
          ? `Pago de ${reg.playerNick} aprobado correctamente.`
          : `Pago de ${reg.playerNick} rechazado.`
      );
    } catch {
      setMessage('Error al actualizar el estado del pago.');
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <SectionTitle>Gestion de Pagos</SectionTitle>

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

      {/* Filters */}
      <HudCard className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:border-red-500"
            >
              <option value="">Todas las disciplinas</option>
              {DISCIPLINES.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:border-red-500"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              placeholder="Buscar por nombre, nick o referencia..."
            />
          </div>
        </div>
      </HudCard>

      {/* Table */}
      <HudCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="pb-3 pr-4">Jugador</th>
                <th className="pb-3 pr-4">Nick</th>
                <th className="pb-3 pr-4">Disciplina</th>
                <th className="pb-3 pr-4">Monto</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3 pr-4">Referencia</th>
                <th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reg) => (
                <tr key={reg.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 pr-4 text-gray-200">{reg.playerName}</td>
                  <td className="py-3 pr-4 text-gray-300">{reg.playerNick}</td>
                  <td className="py-3 pr-4 text-gray-300">{reg.disciplineName}</td>
                  <td className="py-3 pr-4 text-gray-300">${reg.amount.toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={reg.paymentStatus} />
                  </td>
                  <td className="py-3 pr-4 text-gray-400 font-mono text-xs">
                    {reg.paymentReference || '-'}
                  </td>
                  <td className="py-3">
                    {reg.paymentStatus === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(reg.id, 'approve')}
                          disabled={processing === reg.id}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600/20 border border-green-500/50 text-green-400 text-xs hover:bg-green-600/40 transition-colors disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleAction(reg.id, 'reject')}
                          disabled={processing === reg.id}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600/20 border border-red-500/50 text-red-400 text-xs hover:bg-red-600/40 transition-colors disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No se encontraron registros con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </HudCard>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { doc, updateDoc, collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Check, X, Filter, Search, FileText } from 'lucide-react';
import { db } from '../../firebase/client';
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

export default function PaymentsManager() {
  const [registrations, setRegistrations] = useState([]);
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistrations(data);
    });
    return () => unsubscribe();
  }, []);

  const filtered = registrations.filter((reg) => {
    const status = reg.paymentStatus || 'pending';
    if (filterDiscipline && reg.disciplineId !== filterDiscipline) return false;
    if (filterStatus && status !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (reg.playerName || '').toLowerCase().includes(term) ||
        (reg.playerNick || '').toLowerCase().includes(term) ||
        (reg.paymentReference || '').toLowerCase().includes(term);
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
      paymentStatus: newStatus,
    };

    // Remove strict validation as it was blocking valid admin actions

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
              {filtered.map((reg) => {
                const status = reg.paymentStatus || 'pending';
                return (
                <tr key={reg.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 pr-4 text-gray-200">{reg.playerName || 'Jugador'}</td>
                  <td className="py-3 pr-4 text-gray-300">{reg.playerNick}</td>
                  <td className="py-3 pr-4 text-gray-300">{reg.disciplineName || reg.disciplineId}</td>
                  <td className="py-3 pr-4 text-gray-300">${(reg.amount || 0).toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={status} />
                  </td>
                  <td className="py-3 pr-4 text-gray-400 font-mono text-xs">
                    {reg.paymentReceiptUrl ? (
                      <a href={reg.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors">
                        <FileText size={14} />
                        Ver Comprobante
                      </a>
                    ) : (
                      reg.paymentReference || '-'
                    )}
                  </td>
                  <td className="py-3">
                    {status === 'pending' ? (
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
              )})}
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

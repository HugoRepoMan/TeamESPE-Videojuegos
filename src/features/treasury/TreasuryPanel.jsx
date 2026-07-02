import { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/client';
import { deleteRegistration } from '../../firebase/services';
import { calculateRevenueByDiscipline, getPaymentStats } from '../../lib/treasury';
import { exportPlayersCSV, exportRevenueCSV } from '../../lib/csv';
import HudCard from '../../components/ui/HudCard';
import StatCard from '../../components/ui/StatCard';
import DiagonalButton from '../../components/ui/DiagonalButton';
import StatusBadge from '../../components/ui/StatusBadge';
import SectionTitle from '../../components/ui/SectionTitle';
import GameBadge from '../../components/ui/GameBadge';
import { DollarSign, Download, Filter, BarChart3, Users, Trash2 } from 'lucide-react';



const SEED_DISCIPLINES = [
  { id: 'clash-royale', name: 'Clash Royale', slug: 'clash-royale' },
  { id: 'fortnite', name: 'Fortnite', slug: 'fortnite' },
  { id: 'minecraft', name: 'Minecraft', slug: 'minecraft' },
  { id: 'league-of-legends', name: 'League of Legends', slug: 'league-of-legends' },
  { id: 'dragon-ball', name: 'Dragon Ball Sparking Zero', slug: 'dragon-ball' },
  { id: 'fifa-26', name: 'FIFA 26', slug: 'fifa-26' },
  { id: 'mortal-kombat', name: 'Mortal Kombat', slug: 'mortal-kombat' },
];

export default function TreasuryPanel() {
  const [registrations, setRegistrations] = useState([]);
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [processing, setProcessing] = useState(null);

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

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const status = reg.paymentStatus || 'pending';
      const matchDiscipline = filterDiscipline ? reg.disciplineId === filterDiscipline : true;
      const matchStatus = filterStatus ? status === filterStatus : true;
      return matchDiscipline && matchStatus;
    });
  }, [filterDiscipline, filterStatus, registrations]);

  const stats = getPaymentStats(registrations);
  const revenueByDiscipline = calculateRevenueByDiscipline(registrations, SEED_DISCIPLINES);
  const totalRevenue = revenueByDiscipline.reduce((sum, item) => sum + item.total, 0);

  const handleExportPlayers = () => {
    exportPlayersCSV(registrations, SEED_DISCIPLINES);
  };

  const handleExportRevenue = () => {
    exportRevenueCSV(registrations, SEED_DISCIPLINES);
  };

  const handleDelete = async (registrationId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro por completo? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setProcessing(registrationId);
    try {
      await deleteRegistration(registrationId);
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el registro.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-8">
      <SectionTitle>Panel de Tesorería</SectionTitle>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Recaudado"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          variant="gold"
        />
        <StatCard
          label="Pagos Aprobados"
          value={stats.approved}
          icon={CheckCircleIcon}
          variant="success"
        />
        <StatCard
          label="Pagos Pendientes"
          value={stats.pending}
          icon={ClockIcon}
          variant="accent"
        />
        <StatCard
          label="Pagos Rechazados"
          value={stats.rejected}
          icon={XCircleIcon}
          variant="error"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <HudCard>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Filter className="w-5 h-5 text-hud-accent" />
                Registros y Pagos
              </h3>
              <div className="flex gap-4">
                <select
                  value={filterDiscipline}
                  onChange={(e) => setFilterDiscipline(e.target.value)}
                  className="bg-hud-bg border border-hud-border rounded px-3 py-2 text-sm focus:border-hud-accent focus:outline-none"
                >
                  <option value="">Todas las disciplinas</option>
                  {SEED_DISCIPLINES.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-hud-bg border border-hud-border rounded px-3 py-2 text-sm focus:border-hud-accent focus:outline-none"
                >
                  <option value="">Todos los estados</option>
                  <option value="approved">Aprobados</option>
                  <option value="pending">Pendientes</option>
                  <option value="rejected">Rechazados</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hud-border text-hud-text-secondary text-sm">
                    <th className="py-3 px-4 font-medium">Jugador/Nick</th>
                    <th className="py-3 px-4 font-medium">Disciplina</th>
                    <th className="py-3 px-4 font-medium">Monto</th>
                    <th className="py-3 px-4 font-medium">Estado</th>
                    <th className="py-3 px-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredRegistrations.map((reg) => {
                    const discipline = SEED_DISCIPLINES.find(d => d.id === reg.disciplineId);
                    return (
                      <tr key={reg.id} className="border-b border-hud-border/50 hover:bg-hud-bg/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold">{reg.playerNick}</div>
                          {reg.teamName && <div className="text-xs text-hud-text-secondary">{reg.teamName}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <GameBadge name={discipline?.name || reg.disciplineId} slug={discipline?.slug || 'default'} />
                        </td>
                        <td className="py-3 px-4">${(reg.amount || 0).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={reg.paymentStatus || 'pending'} />
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDelete(reg.id)}
                            disabled={processing === reg.id}
                            className="flex items-center gap-1 px-2 py-1 bg-red-900/40 border border-red-700/50 text-red-300 text-xs hover:bg-red-900/60 transition-colors disabled:opacity-50"
                            title="Eliminar Registro"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-hud-text-secondary italic">
                        No se encontraron registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </HudCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <HudCard variant="gold">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-hud-gold" />
              Ingresos por Disciplina
            </h3>
            <div className="space-y-4">
              {revenueByDiscipline.map(item => (
                <div key={item.disciplineName} className="flex justify-between items-center border-b border-hud-border/50 pb-2 last:border-0">
                  <div>
                    <div className="font-bold">{item.disciplineName}</div>
                    <div className="text-xs text-hud-text-secondary">{item.count} aprobados</div>
                  </div>
                  <div className="font-bold text-hud-gold">${item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </HudCard>

          <HudCard>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Download className="w-5 h-5 text-hud-accent" />
              Exportación CSV
            </h3>
            <div className="space-y-3">
              <DiagonalButton
                variant="secondary"
                className="w-full flex justify-center items-center gap-2"
                onClick={handleExportPlayers}
              >
                <Users className="w-4 h-4" />
                Exportar Jugadores
              </DiagonalButton>
              <DiagonalButton
                variant="primary"
                className="w-full flex justify-center items-center gap-2"
                onClick={handleExportRevenue}
              >
                <DollarSign className="w-4 h-4" />
                Exportar Ingresos
              </DiagonalButton>
            </div>
          </HudCard>
        </div>
      </div>
    </div>
  );
}

// Temporary icons for StatCard (since we didn't import them from lucide-react above)
function CheckCircleIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function XCircleIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
}
function ClockIcon(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}

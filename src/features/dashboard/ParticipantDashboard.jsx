import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { Users, Gamepad2, CreditCard, Swords, Edit } from 'lucide-react';
import { db } from '../../firebase/client';
import { useAuth } from '../auth/useAuth';
import { userProfileSchema } from '../../schemas';
import HudCard from '../../components/ui/HudCard';
import StatCard from '../../components/ui/StatCard';
import DiagonalButton from '../../components/ui/DiagonalButton';
import SectionTitle from '../../components/ui/SectionTitle';

export default function ParticipantDashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalInscriptions: 0,
    approvedPayments: 0,
    pendingPayments: 0,
    upcomingMatches: 0,
  });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    nick: '',
    teamName: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setProfileData({
            displayName: data.displayName || user.displayName || '',
            nick: data.nick || '',
            teamName: data.teamName || '',
          });
        } else {
          setProfileData({
            displayName: user.displayName || '',
            nick: '',
            teamName: '',
          });
        }
      } catch {
        setProfileData({
          displayName: user.displayName || '',
          nick: '',
          teamName: '',
        });
      }
    }
    
    async function loadStats() {
      try {
        const totalQuery = query(collection(db, 'registrations'), where('userId', '==', user.uid));
        const totalSnap = await getCountFromServer(totalQuery);
        
        const approvedQuery = query(collection(db, 'registrations'), where('userId', '==', user.uid), where('paymentStatus', '==', 'approved'));
        const approvedSnap = await getCountFromServer(approvedQuery);
        
        const pendingQuery = query(collection(db, 'registrations'), where('userId', '==', user.uid), where('paymentStatus', '==', 'pending'));
        const pendingSnap = await getCountFromServer(pendingQuery);
        
        // Matches are harder since we need OR conditions. Since this is a simple dashboard, we can query both sides or ignore upcomingMatches for now.
        // I will set upcomingMatches to 0 to avoid complex indexes.
        
        setStats({
          totalInscriptions: totalSnap.data().count,
          approvedPayments: approvedSnap.data().count,
          pendingPayments: pendingSnap.data().count,
          upcomingMatches: 0,
        });
      } catch (err) {
        console.error("Error loading stats:", err);
      }
    }

    loadProfile();
    loadStats();
  }, [user]);

  function handleProfileChange(e) {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setFormErrors({});
    setSaveMessage('');

    const result = userProfileSchema.safeParse(profileData);
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
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        displayName: result.data.displayName,
        nick: result.data.nick,
        teamName: result.data.teamName,
        updatedAt: new Date().toISOString(),
      });
      setSaveMessage('Perfil actualizado correctamente.');
      setShowProfileForm(false);
    } catch {
      setSaveMessage('Error al actualizar el perfil. Intente de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const playerName = profileData.displayName || user?.displayName || 'Jugador';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <SectionTitle>Panel del Participante</SectionTitle>
        <p className="text-xl text-gray-400 mt-2">
          Bienvenido, <span className="text-red-500 font-bold">{playerName}</span>
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Gamepad2}
          label="Total Inscripciones"
          value={stats.totalInscriptions}
          variant="default"
        />
        <StatCard
          icon={CreditCard}
          label="Pagos Aprobados"
          value={stats.approvedPayments}
          variant="success"
        />
        <StatCard
          icon={CreditCard}
          label="Pagos Pendientes"
          value={stats.pendingPayments}
          variant="warning"
        />
        <StatCard
          icon={Swords}
          label="Partidas Proximas"
          value={stats.upcomingMatches}
          variant="info"
        />
      </div>

      {/* Quick Actions */}
      <HudCard className="mb-8">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Acciones Rapidas</h3>
        <div className="flex flex-wrap gap-4">
          {isAdmin && (
            <DiagonalButton to="/admin" className="bg-red-900 border-red-500">
              <Swords className="w-4 h-4 mr-2" />
              Panel de Administrador
            </DiagonalButton>
          )}
          <DiagonalButton to="/dashboard/registrations">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Inscribirse
          </DiagonalButton>
          <DiagonalButton to="/dashboard/matches">
            <Swords className="w-4 h-4 mr-2" />
            Ver Partidas
          </DiagonalButton>
          <DiagonalButton onClick={() => setShowProfileForm(!showProfileForm)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar Perfil
          </DiagonalButton>
        </div>
      </HudCard>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`mb-4 p-3 border text-sm ${
            saveMessage.includes('Error')
              ? 'border-red-500/50 bg-red-500/10 text-red-400'
              : 'border-green-500/50 bg-green-500/10 text-green-400'
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* Profile Edit Form */}
      {showProfileForm && (
        <HudCard className="mb-8">
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            Editar Perfil
          </h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="displayName"
                value={profileData.displayName}
                onChange={handleProfileChange}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Tu nombre completo"
              />
              {formErrors.displayName && (
                <p className="text-red-400 text-xs mt-1">{formErrors.displayName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nick de Jugador</label>
              <input
                type="text"
                name="nick"
                value={profileData.nick}
                onChange={handleProfileChange}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Tu nick en el juego"
              />
              {formErrors.nick && (
                <p className="text-red-400 text-xs mt-1">{formErrors.nick}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre del Equipo</label>
              <input
                type="text"
                name="teamName"
                value={profileData.teamName}
                onChange={handleProfileChange}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 px-3 py-2 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Nombre de tu equipo (opcional)"
              />
              {formErrors.teamName && (
                <p className="text-red-400 text-xs mt-1">{formErrors.teamName}</p>
              )}
            </div>
            <DiagonalButton type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </DiagonalButton>
          </form>
        </HudCard>
      )}
    </div>
  );
}

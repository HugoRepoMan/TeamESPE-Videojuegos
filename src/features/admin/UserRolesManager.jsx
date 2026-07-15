import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/client';
import { Shield, Loader2, Search } from 'lucide-react';
import SectionTitle from '../../components/ui/SectionTitle';
import HudCard from '../../components/ui/HudCard';

export default function UserRolesManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setMessage('Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    if (!window.confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;
    
    try {
      setUpdatingId(userId);
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        roleVisible: newRole
      });
      
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole, roleVisible: newRole } : u
      ));
      
      setMessage('Rol actualizado correctamente.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Error al actualizar rol.');
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredUsers = users.filter(u => 
    (u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.playerNick?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <SectionTitle>Gestión de Roles</SectionTitle>
      
      {message && (
        <div className={`mb-6 p-3 border text-sm ${message.includes('Error') ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-green-500/50 bg-green-500/10 text-green-400'}`}>
          {message}
        </div>
      )}

      <HudCard className="mb-6">
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-2">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o nick..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-gray-200 flex-1 text-sm"
          />
        </div>
      </HudCard>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(u => (
            <HudCard key={u.id} className="relative">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-100">{u.displayName || 'Sin Nombre'}</h3>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                  <Shield className="w-4 h-4 text-red-500" />
                </div>
              </div>
              
              <div className="text-sm mb-4">
                <span className="text-gray-500">Nick:</span> <span className="text-gray-200">{u.playerNick || 'N/A'}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Rol:</span>
                <select
                  value={u.role || 'player'}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={updatingId === u.id}
                  className="bg-gray-800 border border-gray-700 text-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-red-500 flex-1"
                >
                  <option value="player">Jugador</option>
                  <option value="juez">Juez</option>
                  <option value="admin">Administrador</option>
                </select>
                {updatingId === u.id && <Loader2 className="w-4 h-4 animate-spin text-red-500" />}
              </div>
            </HudCard>
          ))}
          {filteredUsers.length === 0 && (
            <p className="text-gray-500 py-8 col-span-full text-center">No se encontraron usuarios.</p>
          )}
        </div>
      )}
    </div>
  );
}

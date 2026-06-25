import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../features/auth/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import PageShell from '../components/ui/PageShell';

// Pages & Features
import LandingPage from '../pages/LandingPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ParticipantDashboard from '../features/dashboard/ParticipantDashboard';
import RegistrationsPanel from '../features/dashboard/RegistrationsPanel';
import MatchesPanel from '../features/dashboard/MatchesPanel';
import AdminDashboard from '../features/admin/AdminDashboard';
import PaymentsManager from '../features/admin/PaymentsManager';
import BracketManager from '../features/tournament/BracketManager';
import TreasuryPanel from '../features/treasury/TreasuryPanel';
import OverlayControlPanel from '../features/admin/OverlayControlPanel';
import BroadcastOverlay from '../features/overlay/BroadcastOverlay';
import BracketsPage from '../pages/BracketsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/login',
    element: <PageShell title="Iniciar Sesión" showBack><LoginPage /></PageShell>
  },
  {
    path: '/register',
    element: <PageShell title="Registro de Jugador" showBack><RegisterPage /></PageShell>
  },
  {
    path: '/brackets',
    element: <BracketsPage />
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><PageShell title="Panel del Jugador"><ParticipantDashboard /></PageShell></ProtectedRoute>
  },
  {
    path: '/dashboard/registrations',
    element: <ProtectedRoute><PageShell title="Mis Inscripciones" showBack><RegistrationsPanel /></PageShell></ProtectedRoute>
  },
  {
    path: '/dashboard/matches',
    element: <ProtectedRoute><PageShell title="Mis Partidas" showBack><MatchesPanel /></PageShell></ProtectedRoute>
  },
  {
    path: '/admin',
    element: <AdminRoute><PageShell title="Panel de Administración"><AdminDashboard /></PageShell></AdminRoute>
  },
  {
    path: '/admin/payments',
    element: <AdminRoute><PageShell title="Gestión de Pagos" showBack><PaymentsManager /></PageShell></AdminRoute>
  },
  {
    path: '/admin/brackets',
    element: <AdminRoute><PageShell title="Gestor de Brackets" showBack><BracketManager /></PageShell></AdminRoute>
  },
  {
    path: '/admin/treasury',
    element: <AdminRoute><PageShell title="Tesorería" showBack><TreasuryPanel /></PageShell></AdminRoute>
  },
  {
    path: '/admin/overlay-control',
    element: <AdminRoute><PageShell title="Control de Overlay" showBack><OverlayControlPanel /></PageShell></AdminRoute>
  },
  {
    path: '/overlay/live',
    element: <BroadcastOverlay /> // No PageShell, raw overlay
  }
]);

export default function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { LogIn, Mail, Lock, AlertTriangle, Gamepad2 } from 'lucide-react';
import { useAuth } from './useAuth';
import HudCard from '../../components/ui/HudCard';
import DiagonalButton from '../../components/ui/DiagonalButton';

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Correo no valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

const FIREBASE_ERRORS = {
  'auth/user-not-found': 'No existe una cuenta con este correo.',
  'auth/wrong-password': 'Contrasena incorrecta.',
  'auth/invalid-email': 'El formato del correo no es valido.',
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/too-many-requests': 'Demasiados intentos. Intenta de nuevo mas tarde.',
  'auth/invalid-credential': 'Credenciales no validas. Verifica tu correo y contrasena.',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFirebaseError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFirebaseError('');

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const errorCode = err.code || '';
      const fallbackMessage = err.message 
        ? `Error interno (${errorCode}): ${err.message}` 
        : 'Error al iniciar sesion. Verifica tus credenciales.';
      setFirebaseError(FIREBASE_ERRORS[errorCode] || fallbackMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hud-bg px-4">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-hud-accent opacity-60" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-hud-accent opacity-60" />
        <div className="absolute top-20 left-10 w-px h-40 bg-hud-accent/20 animate-scan" />
        <div className="absolute top-40 right-10 w-px h-60 bg-hud-accent/20 animate-scan" />
        <div className="absolute bottom-20 left-1/4 w-32 h-px bg-hud-accent/10" />
        <div className="absolute top-1/3 right-1/3 w-48 h-px bg-hud-accent/10" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Gamepad2 size={36} className="text-hud-accent" />
            <span className="text-3xl font-bold uppercase tracking-widest text-hud-text">
              ESPE Gaming
            </span>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-hud-accent to-transparent" />
        </div>

        <HudCard variant="accent" clip="both">
          {/* Card header accent */}
          <div className="flex items-center gap-2 mb-6">
            <LogIn size={20} className="text-hud-accent" />
            <h2 className="text-lg font-bold uppercase tracking-wider">Iniciar Sesion</h2>
          </div>

          {/* Firebase error */}
          {firebaseError && (
            <div className="flex items-center gap-2 bg-hud-error/10 border border-hud-error/30 px-4 py-3 mb-6 text-sm text-red-400">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>{firebaseError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email field */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-hud-text-secondary mb-2">
                Correo Electronico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hud-text-secondary" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-hud-bg border ${errors.email ? 'border-hud-error' : 'border-hud-border'} pl-10 pr-4 py-3 text-sm text-hud-text placeholder-hud-text-secondary/50 focus:border-hud-accent focus:outline-none transition-colors`}
                  placeholder="tu@correo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-hud-error">{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-hud-text-secondary mb-2">
                Contrasena
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hud-text-secondary" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-hud-bg border ${errors.password ? 'border-hud-error' : 'border-hud-border'} pl-10 pr-4 py-3 text-sm text-hud-text placeholder-hud-text-secondary/50 focus:border-hud-accent focus:outline-none transition-colors`}
                  placeholder="Tu contrasena"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-hud-error">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <DiagonalButton
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2"
            >
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </DiagonalButton>
          </form>

          {/* Register link */}
          <div className="mt-6 pt-4 border-t border-hud-border text-center">
            <p className="text-sm text-hud-text-secondary">
              No tienes cuenta?{' '}
              <Link to="/register" className="text-hud-accent hover:text-hud-accent-hover font-bold transition-colors">
                Registrate aqui
              </Link>
            </p>
          </div>
        </HudCard>

        {/* Bottom accent line */}
        <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-hud-border to-transparent" />
      </div>
    </div>
  );
}

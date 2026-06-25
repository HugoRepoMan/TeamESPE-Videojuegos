import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { UserPlus, Mail, Lock, User, AlertTriangle, Gamepad2 } from 'lucide-react';
import { useAuth } from './useAuth';
import HudCard from '../../components/ui/HudCard';
import DiagonalButton from '../../components/ui/DiagonalButton';

const registerSchema = z.object({
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'El nombre no puede exceder 50 caracteres'),
  email: z.string().min(1, 'El correo es obligatorio').email('Correo no valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma tu contrasena'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

const FIREBASE_ERRORS = {
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
  'auth/invalid-email': 'El formato del correo no es valido.',
  'auth/weak-password': 'La contrasena es muy debil. Usa al menos 6 caracteres.',
  'auth/operation-not-allowed': 'El registro esta deshabilitado temporalmente.',
  'auth/too-many-requests': 'Demasiados intentos. Intenta de nuevo mas tarde.',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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

    const result = registerSchema.safeParse(formData);
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
      await register(formData.email, formData.password, formData.displayName);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorCode = err.code || '';
      setFirebaseError(FIREBASE_ERRORS[errorCode] || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  const fields = [
    {
      id: 'displayName',
      label: 'Nombre Completo',
      type: 'text',
      autoComplete: 'name',
      placeholder: 'Tu nombre completo',
      icon: User,
    },
    {
      id: 'email',
      label: 'Correo Electronico',
      type: 'email',
      autoComplete: 'email',
      placeholder: 'tu@correo.com',
      icon: Mail,
    },
    {
      id: 'password',
      label: 'Contrasena',
      type: 'password',
      autoComplete: 'new-password',
      placeholder: 'Minimo 6 caracteres',
      icon: Lock,
    },
    {
      id: 'confirmPassword',
      label: 'Confirmar Contrasena',
      type: 'password',
      autoComplete: 'new-password',
      placeholder: 'Repite tu contrasena',
      icon: Lock,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-hud-bg px-4 py-12">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-hud-accent opacity-60" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-hud-accent opacity-60" />
        <div className="absolute top-20 right-16 w-px h-48 bg-hud-accent/20 animate-scan" />
        <div className="absolute bottom-32 left-20 w-px h-32 bg-hud-accent/20 animate-scan" />
        <div className="absolute top-1/4 left-1/3 w-40 h-px bg-hud-accent/10" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-px bg-hud-accent/10" />
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
          {/* Card header */}
          <div className="flex items-center gap-2 mb-6">
            <UserPlus size={20} className="text-hud-accent" />
            <h2 className="text-lg font-bold uppercase tracking-wider">Crear Cuenta</h2>
          </div>

          {/* Firebase error */}
          {firebaseError && (
            <div className="flex items-center gap-2 bg-hud-error/10 border border-hud-error/30 px-4 py-3 mb-6 text-sm text-red-400">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>{firebaseError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {fields.map((field) => {
              const IconComponent = field.icon;
              return (
                <div key={field.id} className="mb-5">
                  <label
                    htmlFor={field.id}
                    className="block text-xs font-bold uppercase tracking-wider text-hud-text-secondary mb-2"
                  >
                    {field.label}
                  </label>
                  <div className="relative">
                    <IconComponent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hud-text-secondary" />
                    <input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      value={formData[field.id]}
                      onChange={handleChange}
                      className={`w-full bg-hud-bg border ${errors[field.id] ? 'border-hud-error' : 'border-hud-border'} pl-10 pr-4 py-3 text-sm text-hud-text placeholder-hud-text-secondary/50 focus:border-hud-accent focus:outline-none transition-colors`}
                      placeholder={field.placeholder}
                    />
                  </div>
                  {errors[field.id] && (
                    <p className="mt-1 text-xs text-hud-error">{errors[field.id]}</p>
                  )}
                </div>
              );
            })}

            {/* Submit */}
            <DiagonalButton
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? 'Registrando...' : 'Registrarse'}
            </DiagonalButton>
          </form>

          {/* Login link */}
          <div className="mt-6 pt-4 border-t border-hud-border text-center">
            <p className="text-sm text-hud-text-secondary">
              Ya tienes cuenta?{' '}
              <Link to="/login" className="text-hud-accent hover:text-hud-accent-hover font-bold transition-colors">
                Inicia sesion
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

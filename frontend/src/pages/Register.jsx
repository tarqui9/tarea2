import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';
import ErrorAlert from '../components/ErrorAlert.jsx';
import AuthShell from './AuthShell.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    setLoading(true);
    try {
      await register(form.nombre, form.email, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Empieza a registrar tus movimientos y metas."
      footer={<>¿Ya tienes cuenta? <Link to="/login" className="font-bold text-indigo-600 hover:underline">Inicia sesión</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="label">Nombre</label>
          <input id="nombre" required autoComplete="name" maxLength={80} className="input" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="tu@email.com" />
        </div>
        <div>
          <label htmlFor="password" className="label">Contraseña</label>
          <input id="password" type="password" required minLength={6} autoComplete="new-password" className="input" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" />
        </div>
        <ErrorAlert message={error} />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Crear cuenta
        </button>
      </form>
    </AuthShell>
  );
}

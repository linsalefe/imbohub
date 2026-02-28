'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, MessageCircle, Users, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!authLoading && user) router.push('/dashboard'); }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sidebar)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--sidebar)' }}>

      {/* ── Lado esquerdo — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(184,92,56,0.12) 0%, transparent 50%, rgba(184,92,56,0.04) 100%)' }} />
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(184,92,56,0.06)' }} />
        <div className="absolute bottom-1/4 right-10 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(184,92,56,0.04)' }} />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className={`relative z-10 max-w-lg transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <img src="/logo-icon-white.png" alt="ImobHub" className="w-12 h-12 object-contain" />
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">ImobHub</span>
              <span className="text-2xl font-light ml-1.5" style={{ color: 'var(--primary)' }}>CRM</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white leading-tight mb-3">
            Gestão Imobiliária
            <br />
            <span style={{ color: 'var(--primary)' }}>Inteligente</span>
          </h1>
          <p className="text-base leading-relaxed max-w-md" style={{ color: 'var(--sidebar-text)' }}>
            Gerencie leads, qualifique com IA e feche mais negócios com
            atendimento automatizado via WhatsApp.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-10">
            {[
              { icon: MessageCircle, label: 'WhatsApp IA' },
              { icon: Users, label: 'Qualificação automática' },
              { icon: BarChart3, label: 'Funil de vendas' },
            ].map((feat, i) => (
              <div
                key={feat.label}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06] transition-all duration-700 ease-out ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${800 + i * 150}ms` }}
              >
                <feat.icon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <span className="text-sm text-gray-300 font-medium">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Divisor vertical ── */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

      {/* ── Lado direito — Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
        <div
          className={`w-full max-w-[420px] transition-all duration-700 ease-out delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src="/logo-icon-white.png" alt="ImobHub" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-white">ImobHub</span>
          </div>

          <div className="rounded-2xl p-8 shadow-2xl shadow-black/25" style={{ backgroundColor: 'var(--surface)' }}>
            {/* Header */}
            <div className="mb-7">
              <h2 className="text-[22px] font-bold" style={{ color: 'var(--text)' }}>Bem-vindo de volta</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Entre com suas credenciais para acessar</p>
            </div>

            {/* Erro */}
            {error && (
              <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger-light)' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                <span className="text-sm" style={{ color: 'var(--danger)' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none"
                    style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all outline-none"
                    style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--muted)' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white font-medium rounded-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-1"
                style={{ backgroundColor: 'var(--primary)', boxShadow: '0 4px 12px rgba(184,92,56,0.25)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] mt-6" style={{ color: 'var(--sidebar-text)' }}>
            ImobHub © {new Date().getFullYear()} — Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
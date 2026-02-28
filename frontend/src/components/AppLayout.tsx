'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';

export default function AppLayout({ children, fullWidth = false }: { children: React.ReactNode; fullWidth?: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--primary)' }} />
          <p className="text-sm animate-pulse" style={{ color: 'var(--muted)' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header - só para páginas normais (não fullWidth) */}
        {!fullWidth && (
          <div className="lg:hidden flex items-center gap-3 px-4 py-3" style={{ backgroundColor: 'var(--sidebar)', borderBottom: '1px solid var(--sidebar-border)' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu"
              className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors"
              style={{ color: 'var(--sidebar-text)' }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-white font-semibold text-[15px] tracking-wide">ImobHub</span>
          </div>
        )}

        {/* Botão hamburger flutuante - para páginas fullWidth (como Conversas) */}
        {fullWidth && (
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu"
            className="lg:hidden fixed top-3 left-3 z-40 p-2 rounded-xl shadow-lg transition-colors"
            style={{ backgroundColor: 'var(--sidebar)', color: 'var(--sidebar-text)', border: '1px solid var(--sidebar-border)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-200 ${fullWidth ? '' : 'p-4 lg:p-6'}`}>
          {children}
        </main>
      </div>

      {/* Busca Global */}
      <CommandPalette />
    </div>
  );
}
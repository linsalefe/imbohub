'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  Radio,
  FileText,
  BarChart3,
  PhoneCall,
  GitBranch,
  Building2,
  Calendar,
  Bot,
  X,
  Search,
  Download,
} from 'lucide-react';

const menuGroups = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/conversations', label: 'Conversas', icon: MessageCircle, hasBadge: true },
      { href: '/pipeline', label: 'Pipeline', icon: GitBranch },
      { href: '/properties', label: 'Imóveis', icon: Building2 },
    ],
  },
  {
    label: 'Configurações',
    items: [
      { href: '/users', label: 'Usuários', icon: Users },
      { href: '/agenda', label: 'Agenda', icon: Calendar },
      { href: '/canais', label: 'Canais', icon: Radio },
      { href: '/ai-config', label: 'IA Config', icon: Bot },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.get('/contacts', { params: { limit: 200 } });
      const contacts = res.data;
      const count = contacts.filter((c: any) => c.unread > 0).length;
      setUnreadCount(count);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (name: string) =>
    name
      ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
      : '??';

  const handleNavClick = () => {
    if (onMobileClose) onMobileClose();
  };

  const openSearch = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }));
  };

  const sidebarContent = (
    <aside
      className={`
        ${collapsed ? 'lg:w-[72px]' : 'lg:w-[250px]'}
        w-[250px] h-screen flex flex-col
        transition-all duration-300 ease-in-out flex-shrink-0
      `}
      style={{ backgroundColor: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
        <div className={`flex items-center gap-3 w-full ${collapsed ? 'lg:justify-center' : 'justify-between'}`}>
          <div className="flex items-center">
            {/* Logo completa (expandido) */}
            <Image
              src="/logo-horizontal-white.png"
              alt="ImobHub CRM"
              width={150}
              height={36}
              className={`object-contain flex-shrink-0 ${collapsed ? 'lg:hidden' : ''}`}
            />
            {/* Só ícone (colapsado) */}
            <Image
              src="/logo-icon-white.png"
              alt="ImobHub"
              width={34}
              height={34}
              className={`object-contain flex-shrink-0 hidden ${collapsed ? 'lg:block' : ''}`}
            />
          </div>
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              aria-label="Fechar menu"
              className="lg:hidden p-1.5 hover:text-white rounded-lg transition-colors"
              style={{ color: 'var(--sidebar-text)' }}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Botão Busca */}
      <div className="px-3 pt-4 pb-1">
        <button
          onClick={openSearch}
          aria-label="Buscar"
          className={`
            w-full flex items-center gap-2.5 rounded-xl transition-all duration-200
            bg-white/[0.04] hover:bg-white/[0.08]
            ${collapsed ? 'lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2' : 'px-3 py-2'}
          `}
          style={{ border: '1px solid var(--sidebar-border)' }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--sidebar-text)' }} />
          <span className={`text-[13px] flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`} style={{ color: 'var(--sidebar-text)' }}>Buscar...</span>
          <kbd className={`px-1.5 py-0.5 bg-white/[0.06] text-[10px] font-medium rounded ${collapsed ? 'lg:hidden' : ''}`} style={{ color: 'var(--sidebar-text)', border: '1px solid var(--sidebar-border)' }}>
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-3 px-3 space-y-5 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p className={`text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 ${collapsed ? 'lg:hidden' : ''}`} style={{ color: 'var(--sidebar-text)' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                const showBadge = (item as any).hasBadge && unreadCount > 0;

                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={`
                        relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                        transition-all duration-200
                        ${collapsed ? 'lg:justify-center' : ''}
                      `}
                      style={{
                        backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                        color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                          e.currentTarget.style.color = 'var(--sidebar-text-active)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--sidebar-text)';
                        }
                      }}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ backgroundColor: 'var(--primary)' }} />
                      )}
                      <div className="relative flex-shrink-0">
                        <Icon
                          className="w-[18px] h-[18px] transition-colors duration-200"
                          style={{ color: isActive ? 'var(--primary)' : 'var(--sidebar-text)' }}
                        />
                        {showBadge && collapsed && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1" style={{ backgroundColor: 'var(--whatsapp)' }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span>
                      {showBadge && !collapsed && (
                        <span className="ml-auto min-w-[20px] h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5" style={{ backgroundColor: 'var(--whatsapp)' }}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Link>

                    {collapsed && (
                      <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50" style={{ backgroundColor: 'var(--sidebar-hover)', border: '1px solid var(--sidebar-border)' }}>
                        {item.label}
                        {showBadge && (
                          <span className="ml-2 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5" style={{ backgroundColor: 'var(--whatsapp)' }}>
                            {unreadCount}
                          </span>
                        )}
                        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderRightColor: 'var(--sidebar-hover)' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="px-3 pb-4 space-y-2 pt-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        {user && (
          <div className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.03] ${collapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              {getInitials(user.name)}
            </div>
            <div className={`min-w-0 flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-medium text-gray-200 truncate leading-tight">{user.name}</p>
              <p className="text-[11px] truncate leading-tight" style={{ color: 'var(--sidebar-text)' }}>{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          aria-label="Sair"
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 text-[13px] ${collapsed ? 'lg:justify-center' : ''}`}
          style={{ color: 'var(--sidebar-text)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--danger)';
            e.currentTarget.style.backgroundColor = 'var(--danger-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--sidebar-text)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut className="w-[16px] h-[16px] flex-shrink-0" />
          <span className={collapsed ? 'lg:hidden' : ''}>Sair</span>
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className={`hidden lg:flex w-full items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-all duration-200 text-[13px] ${collapsed ? 'justify-center' : ''}`}
          style={{ color: 'var(--sidebar-text)' }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Recolher</span></>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block">{sidebarContent}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
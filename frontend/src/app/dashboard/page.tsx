'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, ArrowDownLeft, ArrowUpRight, TrendingUp,
  UserPlus, Loader2, MessageSquare, Activity,
  UserCheck, UserX, Building2, Home, DollarSign,
  Eye, Calendar, GitBranch, CheckCircle2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Stats {
  total_contacts: number;
  new_today: number;
  messages_today: number;
  inbound_today: number;
  outbound_today: number;
  messages_week: number;
  status_counts: Record<string, number>;
  daily_messages: { date: string; day: string; count: number }[];
}

interface AdvancedStats {
  agents: { user_id: number; name: string; leads: number; messages_week: number }[];
  unassigned_leads: number;
  conversion_rate: number;
  converted: number;
  total: number;
  tags: { name: string; color: string; count: number }[];
  new_this_week: number;
  new_last_week: number;
  trend_pct: number;
  avg_response_minutes: number | null;
}

interface PropertyStats {
  total: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  avg_price: Record<string, number>;
}

interface PipelineData {
  id: number;
  name: string;
  stages: { id: number; name: string; key: string; color: string; position: number }[];
}

interface PipelineLeads {
  pipeline_id: number;
  stages: Record<string, { count: number; leads: any[] }>;
}

const typeLabels: Record<string, string> = {
  apartamento: 'Apartamento', casa: 'Casa', terreno: 'Terreno',
  comercial: 'Comercial', rural: 'Rural',
};

const statusLabels: Record<string, string> = {
  disponivel: 'Disponíveis', reservado: 'Reservados',
  vendido: 'Vendidos', alugado: 'Alugados', inativo: 'Inativos',
};

const statusColors: Record<string, string> = {
  disponivel: '#5D7A3A', reservado: '#C8910A',
  vendido: 'var(--primary)', alugado: '#7C6B5C', inativo: '#94867A',
};

const statusColorsHex: Record<string, string> = {
  disponivel: '#5D7A3A', reservado: '#C8910A',
  vendido: '#B85C38', alugado: '#7C6B5C', inativo: '#94867A',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatCurrency(v: number | null): string {
  if (!v) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
}

function formatResponseTime(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// Custom tooltip for AreaChart
function MessagesTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-3 py-2 rounded-xl shadow-lg border border-gray-100">
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="text-[14px] font-bold" style={{ color: 'var(--primary)' }}>{payload[0].value} mensagens</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [advanced, setAdvanced] = useState<AdvancedStats | null>(null);
  const [propStats, setPropStats] = useState<PropertyStats | null>(null);
  const [pipelines, setPipelines] = useState<PipelineData[]>([]);
  const [pipelineLeads, setPipelineLeads] = useState<PipelineLeads | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!authLoading && !user) router.push('/login'); }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadStats();
      const interval = setInterval(loadStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const [res, advRes, propRes, pipRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/advanced'),
        api.get('/properties/stats/summary').catch(() => ({ data: null })),
        api.get('/pipelines').catch(() => ({ data: [] })),
      ]);
      setStats(res.data);
      setAdvanced(advRes.data);
      if (propRes.data) setPropStats(propRes.data);
      if (pipRes.data?.length) {
        setPipelines(pipRes.data);
        try {
          const leadsRes = await api.get(`/pipelines/${pipRes.data[0].id}/leads`);
          setPipelineLeads(leadsRes.data);
        } catch {}
      }
    } catch (err) {
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }
  if (!user) return null;

  if (loading || !stats) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6 max-w-7xl mx-auto p-4 lg:p-6">
          <div className="h-7 bg-gray-200 rounded w-56" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-[100px] bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-[280px] bg-gray-200 rounded-2xl" />
            <div className="h-[280px] bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const maxAgentLeads = advanced ? Math.max(...advanced.agents.map(a => a.leads), 1) : 1;

  // Pipeline stages for mini funnel
  const pipeline = pipelines[0];
  const stagesCounts: { name: string; color: string; count: number }[] = [];
  if (pipeline && pipelineLeads) {
    pipeline.stages
      .sort((a, b) => a.position - b.position)
      .forEach(stage => {
        const stageData = pipelineLeads.stages[stage.key];
        stagesCounts.push({ name: stage.name, color: stage.color, count: stageData?.count || 0 });
      });
  }
  const maxStageCount = Math.max(...stagesCounts.map(s => s.count), 1);

  // Pie chart data for properties
  const pieData = propStats
    ? Object.entries(propStats.by_status).map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
        color: statusColorsHex[status] || '#94a3b8',
      }))
    : [];

  // Area chart data — translate day names
  const dayTranslate: Record<string, string> = {
    Sun: 'Dom', Mon: 'Seg', Tue: 'Ter', Wed: 'Qua', Thu: 'Qui', Fri: 'Sex', Sat: 'Sáb',
  };
  const areaData = stats.daily_messages.map(d => ({
    day: dayTranslate[d.day] || d.day,
    mensagens: d.count,
  }));

  return (
    <AppLayout>
      <div className="space-y-4 lg:space-y-5 max-w-7xl mx-auto overflow-y-auto h-full pb-6 px-4 lg:px-6">

        {/* Header */}
        <div className={`transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <p className="text-sm text-gray-400 mb-0.5">{getGreeting()},</p>
          <h1 className="text-xl lg:text-2xl font-semibold text-[var(--text)] tracking-tight">
            {user.name.split(' ')[0]}
          </h1>
        </div>

        {/* KPI Cards */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 transition-all duration-700 ease-out delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { label: 'Total de Leads', value: stats.total_contacts, icon: Users, iconBg: '#B85C38', iconBgLight: 'var(--primary-light)' },
            { label: 'Novos Hoje', value: stats.new_today, icon: UserPlus, iconBg: '#5D7A3A', iconBgLight: 'var(--success-light)' },
            { label: 'Imóveis Ativos', value: propStats?.by_status?.disponivel || 0, icon: Building2, iconBg: '#7C6B5C', iconBgLight: 'rgba(124,107,92,0.1)' },
            { label: 'Mensagens Hoje', value: stats.messages_today, icon: MessageSquare, iconBg: '#C8910A', iconBgLight: 'var(--warning-light)' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: item.iconBgLight }}
                >
                  <Icon className="w-[18px] h-[18px]" style={{ color: item.iconBg }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--text)] tabular-nums">{item.value}</p>
                  <p className="text-[11px] text-gray-400">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 transition-all duration-700 ease-out delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          {/* Pipeline Funnel */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 lg:p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[var(--text)]">Funil de Vendas</h2>
                <p className="text-[12px] text-gray-400 mt-0.5">{pipeline?.name || 'Pipeline'}</p>
              </div>
              <div className="w-9 h-9 bg-[var(--primary-light)] rounded-lg flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-[var(--primary)]" />
              </div>
            </div>

            {stagesCounts.length === 0 ? (
              <div className="text-center py-8">
                <GitBranch className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[13px] text-gray-400">Nenhum pipeline configurado</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stagesCounts.map((stage, idx) => {
                  const pct = Math.max((stage.count / maxStageCount) * 100, 4);
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium text-gray-600">{stage.name}</span>
                        <span className="text-[12px] font-bold tabular-nums" style={{ color: stage.color }}>
                          {stage.count}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${pct}%`, backgroundColor: stage.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Imóveis por Status — Donut Chart */}
          <div className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[var(--text)]">Imóveis</h2>
                <p className="text-[12px] text-gray-400 mt-0.5">{propStats?.total || 0} cadastrados</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(124,107,92,0.1)' }}>
                <Building2 className="w-4 h-4" style={{ color: '#7C6B5C' }} />
              </div>
            </div>

            {!propStats || propStats.total === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[13px] text-gray-400">Nenhum imóvel cadastrado</p>
              </div>
            ) : (
              <div>
                {/* Donut */}
                <div className="flex justify-center mb-3">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legenda */}
                <div className="space-y-1.5">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[12px] text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-[12px] font-bold tabular-nums" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Tipos */}
                <div className="pt-3 mt-3 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Por tipo</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(propStats.by_type).map(([type, count]) => (
                      <span key={type} className="text-[11px] px-2 py-1 rounded-lg bg-gray-50 text-gray-600 font-medium">
                        {typeLabels[type] || type}: {count}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ticket médio */}
                {Object.keys(propStats.avg_price).length > 0 && (
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Ticket médio</p>
                    <div className="space-y-1">
                      {Object.entries(propStats.avg_price).map(([type, avg]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-[11px] text-gray-500">{type === 'venda' ? 'Venda' : 'Aluguel'}</span>
                          <span className="text-[12px] font-bold" style={{ color: '#5D7A3A' }}>{formatCurrency(avg)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mensagens da Semana + Performance */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 transition-all duration-700 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          {/* Gráfico de mensagens — Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 lg:p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-semibold text-[var(--text)]">Mensagens da Semana</h2>
                <p className="text-[12px] text-gray-400 mt-0.5">{stats.messages_week} no total</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--warning-light)' }}>
                <MessageSquare className="w-4 h-4" style={{ color: '#C8910A' }} />
              </div>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="msgGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B85C38" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#B85C38" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<MessagesTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="mensagens"
                    stroke="#B85C38"
                    strokeWidth={2.5}
                    fill="url(#msgGradient)"
                    dot={{ r: 4, fill: '#B85C38', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#B85C38', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance por Corretor */}
          {advanced && (
            <div className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-[var(--text)]">Corretores</h2>
                  <p className="text-[12px] text-gray-400 mt-0.5">Leads atribuídos</p>
                </div>
                <div className="w-9 h-9 bg-[var(--primary-light)] rounded-lg flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-[var(--primary)]" />
                </div>
              </div>

              {advanced.agents.length === 0 ? (
                <div className="text-center py-6">
                  <UserX className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-[13px] text-gray-400">Nenhum lead atribuído</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {advanced.agents.map((agent) => {
                    const pct = (agent.leads / maxAgentLeads) * 100;
                    return (
                      <div key={agent.user_id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] text-[9px] font-bold">
                              {agent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <span className="text-[12px] font-medium text-gray-700">{agent.name.split(' ')[0]}</span>
                          </div>
                          <span className="text-[11px] font-bold text-[var(--primary)] tabular-nums">{agent.leads}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--primary)] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {advanced.unassigned_leads > 0 && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[12px] text-gray-400">Sem atribuição</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ color: '#C8910A', backgroundColor: 'var(--warning-light)' }}>{advanced.unassigned_leads}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumo inferior */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 transition-all duration-700 ease-out delay-[400ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { label: 'Recebidas Hoje', value: stats.inbound_today, icon: ArrowDownLeft, iconColor: '#5D7A3A', iconBgLight: 'var(--success-light)' },
            { label: 'Enviadas Hoje', value: stats.outbound_today, icon: ArrowUpRight, iconColor: '#B85C38', iconBgLight: 'var(--primary-light)' },
            { label: 'Novos (semana)', value: advanced?.new_this_week || 0, icon: TrendingUp, iconColor: '#C8910A', iconBgLight: 'var(--warning-light)', extra: advanced ? `${advanced.trend_pct >= 0 ? '+' : ''}${advanced.trend_pct}%` : null },
            { label: 'Resp. Média', value: formatResponseTime(advanced?.avg_response_minutes || null), icon: Activity, iconColor: '#7C6B5C', iconBgLight: 'rgba(124,107,92,0.1)' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-white rounded-2xl p-3 lg:p-4 border border-gray-100 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: item.iconBgLight }}
                >
                  <Icon className="w-4 h-4" style={{ color: item.iconColor }} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-lg font-bold tabular-nums" style={{ color: item.iconColor }}>{item.value}</p>
                    {(item as any).extra && (
                      <span className={`text-[10px] font-semibold px-1 py-0.5 rounded ${
                        String((item as any).extra).startsWith('+') ? 'text-[#5D7A3A] bg-[rgba(93,122,58,0.1)]' : 'text-[#A63D3D] bg-[rgba(166,61,61,0.1)]'
                      }`}>{(item as any).extra}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </AppLayout>
  );
}
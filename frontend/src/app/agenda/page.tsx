'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import ConfirmModal from '@/components/ConfirmModal';
import { Calendar, Clock, Phone, User, Building2, Plus, X, ChevronLeft, ChevronRight, MapPin, UserCheck, Trash2, Edit3, Check, Ban, Home, Handshake } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

interface Schedule {
  id: number;
  type: string;
  contact_wa_id: string;
  contact_name: string;
  phone: string;
  course: string;
  scheduled_date: string;
  scheduled_time: string;
  scheduled_at: string;
  status: string;
  notes: string;
  created_at: string;
}

interface Stats {
  pending: number;
  today: number;
  completed: number;
  cancelled: number;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: 'text-[#C8910A]', bg: 'border' },
  completed: { label: 'Concluído', color: 'text-[#5D7A3A]', bg: 'border' },
  failed: { label: 'Falhou', color: 'text-[#A63D3D]', bg: 'border' },
  cancelled: { label: 'Cancelado', color: 'text-[#94867A]', bg: 'border' },
};

const TYPE_MAP: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  visita: { label: 'Visita', icon: Home, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-light)]' },
  reuniao: { label: 'Reunião', icon: Handshake, color: 'text-[#7C6B5C]', bg: 'bg-[rgba(124,107,92,0.1)]' },
  ligacao: { label: 'Ligação', icon: Phone, color: 'text-[#5D7A3A]', bg: 'bg-[rgba(93,122,58,0.1)]' },
  voice_ai: { label: 'Voice AI', icon: Phone, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary-light)]' },
  consultant: { label: 'Corretor', icon: UserCheck, color: 'text-[#C8910A]', bg: 'bg-[rgba(200,145,10,0.1)]' },
};

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function AgendaPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, today: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Form
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formProperty, setFormProperty] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formType, setFormType] = useState('visita');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch(`${API}/schedules?limit=500`, { headers });
      if (res.ok) setSchedules(await res.json());
    } catch { toast.error('Erro ao carregar dados'); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/schedules/stats`, { headers });
      if (res.ok) setStats(await res.json());
    } catch { toast.error('Erro ao carregar dados'); }
  }, []);

  useEffect(() => {
    Promise.all([fetchSchedules(), fetchStats()]).finally(() => setLoading(false));
    const interval = setInterval(() => { fetchSchedules(); fetchStats(); }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getSchedulesForDate = (dateStr: string) => {
    return schedules.filter(s => s.scheduled_date === dateStr);
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const openNewSchedule = (date?: string) => {
    setEditingSchedule(null);
    setFormName(''); setFormPhone(''); setFormProperty('');
    setFormDate(date || new Date().toISOString().split('T')[0]);
    setFormTime('10:00'); setFormType('visita'); setFormNotes('');
    setShowModal(true);
  };

  const openEditSchedule = (s: Schedule) => {
    setEditingSchedule(s);
    setFormName(s.contact_name); setFormPhone(s.phone); setFormProperty(s.course);
    setFormDate(s.scheduled_date); setFormTime(s.scheduled_time);
    setFormType(s.type); setFormNotes(s.notes);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formPhone || !formDate || !formTime) return;
    setSaving(true);
    try {
      const phoneClean = formPhone.replace(/\D/g, '');
      if (editingSchedule) {
        await fetch(`${API}/schedules/${editingSchedule.id}`, {
          method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduled_date: formDate, scheduled_time: formTime, notes: formNotes, type: formType }),
        });
      } else {
        await fetch(`${API}/schedules`, {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contact_wa_id: phoneClean, contact_name: formName, phone: phoneClean,
            course: formProperty, scheduled_date: formDate, scheduled_time: formTime,
            type: formType, notes: formNotes,
          }),
        });
      }
      setShowModal(false);
      fetchSchedules(); fetchStats();
      toast.success(editingSchedule ? 'Agendamento atualizado' : 'Agendamento criado');
    } catch { toast.error('Erro ao salvar agendamento'); }
    finally { setSaving(false); }
  };

  const handleCancel = async (id: number) => {
    setConfirmAction({
      title: 'Cancelar agendamento',
      message: 'Tem certeza que deseja cancelar este agendamento?',
      onConfirm: async () => {
        await fetch(`${API}/schedules/${id}`, {
          method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' }),
        });
        toast.success('Agendamento cancelado');
        fetchSchedules(); fetchStats(); setConfirmAction(null);
      },
    });
  };

  const handleDelete = async (id: number) => {
    setConfirmAction({
      title: 'Deletar agendamento',
      message: 'Tem certeza que deseja deletar este agendamento permanentemente?',
      onConfirm: async () => {
        await fetch(`${API}/schedules/${id}`, { method: 'DELETE', headers });
        toast.success('Agendamento deletado');
        fetchSchedules(); fetchStats(); setConfirmAction(null);
      },
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const filteredSchedules = schedules.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'today') return s.scheduled_date === today;
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'visita') return s.type === 'visita';
    if (filter === 'reuniao') return s.type === 'reuniao';
    if (filter === 'ligacao') return s.type === 'ligacao';
    return s.status === filter;
  }).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));

  const selectedDaySchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto h-full" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="px-4 lg:px-6 py-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold" style={{ color: 'var(--text)' }}>Agenda</h1>
              <p className="text-[13px]" style={{ color: 'var(--muted)' }}>Visitas, reuniões e ligações com leads</p>
            </div>
            <button onClick={() => openNewSchedule()} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium w-fit shadow-sm" style={{ backgroundColor: 'var(--primary)' }}>
              <Plus className="w-4 h-4" /> Novo Agendamento
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
            {[
              { label: 'Hoje', value: stats.today, color: '#B85C38', bgLight: 'var(--primary-light)' },
              { label: 'Pendentes', value: stats.pending, color: '#C8910A', bgLight: 'var(--warning-light)' },
              { label: 'Concluídos', value: stats.completed, color: '#5D7A3A', bgLight: 'var(--success-light)' },
              { label: 'Cancelados', value: stats.cancelled, color: '#94867A', bgLight: 'rgba(148,134,122,0.1)' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-3 lg:p-4 border border-gray-100">
                <p className="text-xl lg:text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[11px] lg:text-xs mt-1" style={{ color: 'var(--muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button onClick={() => setView('calendar')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === 'calendar' ? 'text-white shadow-sm' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'}`} style={view === 'calendar' ? { backgroundColor: 'var(--primary)' } : {}}>
              <Calendar className="w-4 h-4 inline mr-1.5" />Calendário
            </button>
            <button onClick={() => setView('list')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${view === 'list' ? 'text-white shadow-sm' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'}`} style={view === 'list' ? { backgroundColor: 'var(--primary)' } : {}}>
              <Clock className="w-4 h-4 inline mr-1.5" />Lista
            </button>
            <div className="ml-auto">
              <select value={filter} onChange={e => setFilter(e.target.value)} className="text-sm border border-gray-100 rounded-xl px-3 py-2 bg-white">
                <option value="all">Todos</option>
                <option value="today">Hoje</option>
                <option value="pending">Pendentes</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
                <option value="visita">Visitas</option>
                <option value="reuniao">Reuniões</option>
                <option value="ligacao">Ligações</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>
          ) : view === 'calendar' ? (
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Calendar — expanded */}
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-5">
                  <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5" style={{ color: 'var(--muted)' }} /></button>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                  <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><ChevronRight className="w-5 h-5" style={{ color: 'var(--muted)' }} /></button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEKDAYS.map(d => <div key={d} className="text-center text-xs font-semibold py-3" style={{ color: 'var(--muted)' }}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const daySchedules = getSchedulesForDate(dateStr);
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDate;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                        className="relative rounded-xl text-sm transition-all flex flex-col items-center justify-center"
                        style={{
                          minHeight: '72px',
                          backgroundColor: isSelected ? 'var(--primary)' : isToday ? 'var(--primary-light)' : 'transparent',
                          color: isSelected ? '#fff' : isToday ? 'var(--primary)' : 'var(--text)',
                          fontWeight: isToday || isSelected ? 600 : 400,
                        }}
                        onMouseEnter={e => { if (!isSelected && !isToday) e.currentTarget.style.backgroundColor = '#f5f0eb'; }}
                        onMouseLeave={e => { if (!isSelected && !isToday) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <span className="text-[14px]">{day}</span>
                        {daySchedules.length > 0 && (
                          <div className="flex gap-0.5 mt-1.5 flex-wrap justify-center">
                            {daySchedules.slice(0, 3).map(s => (
                              <div key={s.id} className="w-1.5 h-1.5 rounded-full" style={{
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' :
                                  s.status === 'pending' ? '#C8910A' :
                                  s.status === 'completed' ? '#5D7A3A' : '#94867A'
                              }} />
                            ))}
                            {daySchedules.length > 3 && (
                              <span className="text-[9px]" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>+{daySchedules.length - 3}</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Side panel */}
              <div className="w-full lg:w-[400px] bg-white rounded-2xl border border-gray-100 p-5 max-h-[650px] overflow-y-auto">
                {selectedDate ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold" style={{ color: 'var(--text)' }}>{formatDate(selectedDate)}</h4>
                      <button onClick={() => openNewSchedule(selectedDate)} className="p-2 rounded-xl transition-colors" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {selectedDaySchedules.length === 0 ? (
                      <div className="text-center py-16">
                        <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--border)' }} />
                        <p className="text-sm" style={{ color: 'var(--muted)' }}>Nenhum agendamento neste dia</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedDaySchedules.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time)).map(s => (
                          <ScheduleCard key={s.id} schedule={s} onEdit={openEditSchedule} onCancel={handleCancel} onDelete={handleDelete} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20">
                    <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--border)' }} />
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>Selecione um dia no calendário</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {filteredSchedules.length === 0 ? (
                <div className="text-center py-20">
                  <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--border)' }} />
                  <p style={{ color: 'var(--muted)' }} className="text-sm">Nenhum agendamento encontrado</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredSchedules.map(s => {
                    const typeInfo = TYPE_MAP[s.type] || TYPE_MAP.visita;
                    const TypeIcon = typeInfo.icon;
                    return (
                      <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeInfo.bg}`}>
                          <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{s.contact_name || s.phone}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.course ? `${typeInfo.label} · ${s.course}` : typeInfo.label}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{formatDate(s.scheduled_date)}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.scheduled_time}</p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[s.status]?.bg || 'border'} ${STATUS_MAP[s.status]?.color || 'text-gray-500'}`} style={{ borderColor: 'var(--border)' }}>
                          {STATUS_MAP[s.status]?.label || s.status}
                        </div>
                        <div className="flex gap-1">
                          {s.status === 'pending' && (
                            <>
                              <button onClick={() => openEditSchedule(s)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" style={{ color: 'var(--muted)' }}><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => handleCancel(s.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" style={{ color: 'var(--muted)' }}><Ban className="w-4 h-4" /></button>
                            </>
                          )}
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" style={{ color: 'var(--muted)' }}><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" style={{ color: 'var(--muted)' }} /></button>
            </div>

            <div className="space-y-4">
              {!editingSchedule && (
                <>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Nome do Lead</label>
                    <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm" style={{ borderColor: 'var(--border)' }} placeholder="Nome completo" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Telefone *</label>
                    <input value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm" style={{ borderColor: 'var(--border)' }} placeholder="5581999999999" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Imóvel / Endereço</label>
                    <input value={formProperty} onChange={e => setFormProperty(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm" style={{ borderColor: 'var(--border)' }} placeholder="Ex: Apt 3 quartos no Cruzeiro" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Data *</label>
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm" style={{ borderColor: 'var(--border)' }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Horário *</label>
                  <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm" style={{ borderColor: 'var(--border)' }} />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Tipo</label>
                <div className="flex gap-2">
                  {[
                    { key: 'visita', label: 'Visita', icon: Home },
                    { key: 'reuniao', label: 'Reunião', icon: Handshake },
                    { key: 'ligacao', label: 'Ligação', icon: Phone },
                  ].map(t => {
                    const Icon = t.icon;
                    const active = formType === t.key;
                    return (
                      <button key={t.key} onClick={() => setFormType(t.key)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all"
                        style={{
                          borderColor: active ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: active ? 'var(--primary-light)' : 'transparent',
                          color: active ? 'var(--primary)' : 'var(--muted)',
                        }}
                      >
                        <Icon className="w-4 h-4" /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--muted)' }}>Notas</label>
                <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} className="w-full px-3 py-2.5 border rounded-xl text-sm resize-none" style={{ borderColor: 'var(--border)' }} placeholder="Observações..." />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving || !formPhone || !formDate || !formTime} className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all" style={{ backgroundColor: 'var(--primary)' }}>
                {saving ? 'Salvando...' : editingSchedule ? 'Atualizar' : 'Agendar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <ConfirmModal
          open={!!confirmAction}
          title={confirmAction.title}
          message={confirmAction.message}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </AppLayout>
  );
}

function ScheduleCard({ schedule: s, onEdit, onCancel, onDelete }: { schedule: Schedule; onEdit: (s: Schedule) => void; onCancel: (id: number) => void; onDelete: (id: number) => void }) {
  const typeInfo = TYPE_MAP[s.type] || TYPE_MAP.visita;
  const TypeIcon = typeInfo.icon;

  return (
    <div className={`p-3.5 rounded-xl border ${s.status === 'cancelled' ? 'opacity-50' : ''}`} style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.bg}`}>
            <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{s.contact_name || s.phone}</p>
            <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{typeInfo.label}</p>
          </div>
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{s.scheduled_time}</span>
      </div>

      {s.course && (
        <div className="flex items-center gap-1.5 mb-2">
          <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>{s.course}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 mb-2">
        <Phone className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{s.phone}</span>
      </div>

      {s.notes && <p className="text-xs italic mb-2" style={{ color: 'var(--muted)' }}>{s.notes}</p>}

      {s.status === 'pending' && (
        <div className="flex gap-1.5 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => onEdit(s)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg transition-colors hover:bg-white" style={{ color: 'var(--muted)' }}>
            <Edit3 className="w-3 h-3" /> Editar
          </button>
          <button onClick={() => onCancel(s.id)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg transition-colors hover:bg-white" style={{ color: '#A63D3D' }}>
            <Ban className="w-3 h-3" /> Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
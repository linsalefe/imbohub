'use client';
import { useEffect, useState } from 'react';
import {
  Users, Loader2, RefreshCw, Phone, Clock, Search,
  Sparkles, MessageCircle, ChevronDown, Plus, Settings,
  GripVertical, Trash2, Pencil, X, Check
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';

interface Stage {
  id: number;
  pipeline_id: number;
  name: string;
  key: string;
  color: string;
  position: number;
  is_active: boolean;
}

interface PipelineData {
  id: number;
  name: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  stages: Stage[];
}

interface Lead {
  wa_id: string;
  name: string;
  email: string | null;
  interest_type: string | null;
  budget_min: number | null;
  budget_max: number | null;
  preferred_neighborhoods: string | null;
  preferred_property_type: string | null;
  stage_id: number | null;
  created_at: string;
  updated_at: string;
}

interface PipelineLeadsResponse {
  pipeline_id: number;
  stages: (Stage & { leads: Lead[]; count: number })[];
}

export default function PipelinePage() {
  const [pipelines, setPipelines] = useState<PipelineData[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<number | null>(null);
  const [pipelineLeads, setPipelineLeads] = useState<PipelineLeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [draggedWaId, setDraggedWaId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [showPipelineMenu, setShowPipelineMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Configurações do pipeline
  const [editingStage, setEditingStage] = useState<number | null>(null);
  const [editStageName, setEditStageName] = useState('');
  const [editStageColor, setEditStageColor] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [newPipelineName, setNewPipelineName] = useState('');
  const [showNewPipeline, setShowNewPipeline] = useState(false);

  const colors = ['#B85C38', '#f59e0b', '#7C6B5C', '#06b6d4', '#f97316', '#10b981', '#ef4444', '#ec4899', '#14b8a6', '#64748b'];

  // === Load Pipelines ===
  const loadPipelines = async () => {
    try {
      const res = await api.get('/pipelines');
      setPipelines(res.data);
      if (!activePipelineId && res.data.length > 0) {
        setActivePipelineId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // === Load Pipeline Leads ===
  const loadPipelineLeads = async (pipelineId: number) => {
    try {
      const res = await api.get(`/pipelines/${pipelineId}/leads`);
      setPipelineLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipelines();
  }, []);

  useEffect(() => {
    if (activePipelineId) {
      setLoading(true);
      loadPipelineLeads(activePipelineId);
      const interval = setInterval(() => loadPipelineLeads(activePipelineId), 15000);
      return () => clearInterval(interval);
    }
  }, [activePipelineId]);

  const activePipeline = pipelines.find(p => p.id === activePipelineId);

  // === Move Lead ===
  const moveLead = async (waId: string, newStageId: number) => {
    if (!activePipelineId) return;

    // Optimistic update
    setPipelineLeads(prev => {
      if (!prev) return prev;
      const lead = prev.stages.flatMap(s => s.leads).find(l => l.wa_id === waId);
      if (!lead) return prev;

      return {
        ...prev,
        stages: prev.stages.map(s => ({
          ...s,
          leads: s.id === newStageId
            ? [...s.leads, { ...lead, stage_id: newStageId }]
            : s.leads.filter(l => l.wa_id !== waId),
          count: s.id === newStageId ? s.count + 1 : s.leads.filter(l => l.wa_id !== waId).length,
        })),
      };
    });

    try {
      await api.patch(`/pipelines/${activePipelineId}/leads/${waId}/move`, { stage_id: newStageId });
    } catch (err) {
      console.error(err);
      if (activePipelineId) loadPipelineLeads(activePipelineId);
    }
  };

  // === Drag Handlers ===
  const handleDragStart = (e: React.DragEvent, waId: string) => {
    setDraggedWaId(waId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', waId);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedWaId(null);
    setDropTarget(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, stageId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(stageId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stageId: number) => {
    e.preventDefault();
    setDropTarget(null);
    const waId = e.dataTransfer.getData('text/plain');
    if (waId && draggedWaId) {
      const currentStage = pipelineLeads?.stages.find(s => s.leads.some(l => l.wa_id === waId));
      if (currentStage && currentStage.id !== stageId) {
        moveLead(waId, stageId);
      }
    }
    setDraggedWaId(null);
  };

  // === Pipeline CRUD ===
  const createPipeline = async () => {
    if (!newPipelineName.trim()) return;
    try {
      const res = await api.post('/pipelines', { name: newPipelineName });
      setPipelines(prev => [...prev, res.data]);
      setActivePipelineId(res.data.id);
      setNewPipelineName('');
      setShowNewPipeline(false);
    } catch (err) {
      console.error(err);
    }
  };

  // === Stage CRUD ===
  const addStage = async () => {
    if (!newStageName.trim() || !activePipelineId) return;
    const key = newStageName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    try {
      await api.post(`/pipelines/${activePipelineId}/stages`, {
        name: newStageName,
        key,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      setNewStageName('');
      await loadPipelines();
      loadPipelineLeads(activePipelineId);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStage = async (stageId: number) => {
    if (!activePipelineId) return;
    try {
      await api.patch(`/pipelines/${activePipelineId}/stages/${stageId}`, {
        name: editStageName || undefined,
        color: editStageColor || undefined,
      });
      setEditingStage(null);
      await loadPipelines();
      loadPipelineLeads(activePipelineId);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteStage = async (stageId: number) => {
    if (!activePipelineId) return;
    if (!confirm('Tem certeza que deseja excluir este estágio?')) return;
    try {
      await api.delete(`/pipelines/${activePipelineId}/stages/${stageId}`);
      await loadPipelines();
      loadPipelineLeads(activePipelineId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao excluir estágio');
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  const filterLeads = (leads: Lead[]) => {
    if (!search) return leads;
    const s = search.toLowerCase();
    return leads.filter(l =>
      (l.name || '').toLowerCase().includes(s) ||
      l.wa_id.includes(s) ||
      (l.preferred_property_type || '').toLowerCase().includes(s) ||
      (l.preferred_neighborhoods || '').toLowerCase().includes(s)
    );
  };

  const totalLeads = pipelineLeads?.stages.reduce((acc, s) => acc + s.count, 0) || 0;

  return (
    <AppLayout>
      <div className="flex-1 bg-[var(--bg)] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-start lg:items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center shadow-md flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-[var(--text)]">Pipeline</h1>
                <p className="text-[12px] text-gray-400">
                  {activePipeline?.name || 'Carregando...'} · {totalLeads} leads
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Pipeline Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowPipelineMenu(!showPipelineMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-[13px] text-gray-700 hover:border-[var(--primary)/20] transition-all"
                >
                  <span className="max-w-[120px] truncate">{activePipeline?.name || 'Selecionar'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showPipelineMenu && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1">
                    {pipelines.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setActivePipelineId(p.id); setShowPipelineMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors ${
                          p.id === activePipelineId ? 'text-[var(--primary)] font-medium bg-[var(--primary-light)]' : 'text-gray-700'
                        }`}
                      >
                        {p.name}
                        {p.is_default && <span className="ml-2 text-[10px] text-gray-400">(Padrão)</span>}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      {showNewPipeline ? (
                        <div className="px-3 py-2 flex gap-2">
                          <input
                            value={newPipelineName}
                            onChange={e => setNewPipelineName(e.target.value)}
                            placeholder="Nome do funil..."
                            className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
                            onKeyDown={e => e.key === 'Enter' && createPipeline()}
                            autoFocus
                          />
                          <button onClick={createPipeline} className="p-1.5 text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-lg">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setShowNewPipeline(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowNewPipeline(true)}
                          className="w-full text-left px-4 py-2.5 text-[13px] text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Novo funil
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar lead..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-[13px] bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] w-40 lg:w-52"
                />
              </div>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-xl border transition-all ${
                  showSettings
                    ? 'border-[var(--primary)/30] bg-[var(--primary-light)] text-[var(--primary)]'
                    : 'border-gray-200 bg-white text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)/20]'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={() => { setLoading(true); if (activePipelineId) loadPipelineLeads(activePipelineId); }}
                className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)/20] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats pills */}
          {pipelineLeads && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
              {pipelineLeads.stages.map(stage => (
                <div
                  key={stage.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-100 bg-white text-[12px] whitespace-nowrap"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                  <span className="text-gray-500">{stage.name}</span>
                  <span className="font-bold text-gray-800">{stage.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && activePipeline && (
          <div className="px-4 lg:px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-gray-800">Configurar Estágios — {activePipeline.name}</h3>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {activePipeline.stages.map(stage => (
                <div key={stage.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50">
                  {editingStage === stage.id ? (
                    <>
                      <input
                        value={editStageName}
                        onChange={e => setEditStageName(e.target.value)}
                        className="w-28 px-2 py-1 rounded border border-gray-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
                        autoFocus
                      />
                      <select
                        value={editStageColor}
                        onChange={e => setEditStageColor(e.target.value)}
                        className="px-1 py-1 rounded border border-gray-200 text-[12px]"
                      >
                        {colors.map(c => (
                          <option key={c} value={c} style={{ color: c }}>●</option>
                        ))}
                      </select>
                      <button onClick={() => updateStage(stage.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingStage(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                      <span className="text-[12px] font-medium text-gray-700">{stage.name}</span>
                      <button
                        onClick={() => { setEditingStage(stage.id); setEditStageName(stage.name); setEditStageColor(stage.color); }}
                        className="p-1 text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded ml-1"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteStage(stage.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* Add stage */}
              <div className="flex items-center gap-1.5">
                <input
                  value={newStageName}
                  onChange={e => setNewStageName(e.target.value)}
                  placeholder="Novo estágio..."
                  className="w-32 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-[var(--primary)/30]"
                  onKeyDown={e => e.key === 'Enter' && addStage()}
                />
                {newStageName && (
                  <button onClick={addStage} className="p-2 text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-xl">
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : pipelineLeads ? (
            <div className="flex gap-4 h-full" style={{ minWidth: `${pipelineLeads.stages.length * 300}px` }}>
              {pipelineLeads.stages.map(stage => {
                const stageLeads = filterLeads(stage.leads);
                const isDropping = dropTarget === stage.id;

                return (
                  <div
                    key={stage.id}
                    className={`flex-1 min-w-[270px] max-w-[320px] flex flex-col rounded-2xl transition-all ${
                      isDropping ? 'ring-2 ring-[var(--primary)/30] bg-[var(--primary-light)]/50' : 'bg-gray-50/80'
                    }`}
                    onDragOver={(e) => handleDragOver(e, stage.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                    {/* Column Header */}
                    <div className="p-3 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                        <span className="text-[13px] font-semibold text-gray-700">{stage.name}</span>
                      </div>
                      <span
                        className="text-[12px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                      >
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                      {stageLeads.length === 0 && (
                        <div className="text-center py-8 text-gray-300">
                          <p className="text-[12px]">Nenhum lead</p>
                        </div>
                      )}

                      {stageLeads.map(lead => (
                        <div
                          key={lead.wa_id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.wa_id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedLead(lead)}
                          className={`bg-white rounded-xl border border-gray-100 p-3.5 cursor-grab active:cursor-grabbing hover:border-gray-200 hover:shadow-sm transition-all select-none ${
                            draggedWaId === lead.wa_id ? 'opacity-50 scale-[0.98]' : ''
                          }`}
                        >
                          {/* Name + Avatar */}
                          <div className="flex items-center gap-2.5 mb-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                              style={{ backgroundColor: stage.color }}
                            >
                              {(lead.name || '?')[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-gray-800 truncate">
                                {lead.name || 'Sem nome'}
                              </p>
                              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                +{lead.wa_id}
                              </p>
                            </div>
                          </div>

                          {/* Imob Info */}
                          <div className="space-y-1 mb-2">
                            {lead.interest_type && (
                              <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium mr-1">
                                {lead.interest_type === 'compra' ? '🏠 Compra' : lead.interest_type === 'aluguel' ? '🔑 Aluguel' : '🏠🔑 Ambos'}
                              </span>
                            )}
                            {lead.preferred_property_type && (
                              <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-medium mr-1">
                                {lead.preferred_property_type}
                              </span>
                            )}
                            {(lead.budget_min || lead.budget_max) && (
                              <p className="text-[10px] text-gray-500">
                                💰 {lead.budget_min ? formatCurrency(lead.budget_min) : '...'} — {lead.budget_max ? formatCurrency(lead.budget_max) : '...'}
                              </p>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(lead.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Modal Lead Detail */}
        {selectedLead && pipelineLeads && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedLead(null)}>
            <div className="bg-white rounded-2xl w-[calc(100vw-2rem)] lg:w-[500px] max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 space-y-5">

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary-light)] flex items-center justify-center">
                      <span className="text-lg font-bold text-[var(--primary)]">
                        {(selectedLead.name || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-gray-900">{selectedLead.name || 'Sem nome'}</p>
                      <p className="text-[12px] text-gray-400 flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> +{selectedLead.wa_id}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedLead.interest_type && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                      <span className="text-[14px]">🏠</span>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Interesse</p>
                        <p className="text-[12px] text-gray-700 font-medium capitalize">{selectedLead.interest_type}</p>
                      </div>
                    </div>
                  )}
                  {selectedLead.preferred_property_type && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                      <span className="text-[14px]">🏢</span>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Tipo</p>
                        <p className="text-[12px] text-gray-700 font-medium capitalize">{selectedLead.preferred_property_type}</p>
                      </div>
                    </div>
                  )}
                  {(selectedLead.budget_min || selectedLead.budget_max) && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                      <span className="text-[14px]">💰</span>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Orçamento</p>
                        <p className="text-[12px] text-gray-700 font-medium">
                          {selectedLead.budget_min ? formatCurrency(selectedLead.budget_min) : '...'} — {selectedLead.budget_max ? formatCurrency(selectedLead.budget_max) : '...'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Entrada</p>
                      <p className="text-[12px] text-gray-700 font-medium">{formatDate(selectedLead.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Move Status */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Mover para</p>
                  <div className="grid grid-cols-3 gap-2">
                    {pipelineLeads.stages.map(stage => (
                      <button
                        key={stage.id}
                        onClick={() => { moveLead(selectedLead.wa_id, stage.id); setSelectedLead(null); }}
                        disabled={selectedLead.stage_id === stage.id}
                        className={`py-2 rounded-xl text-[11px] font-medium border transition-all ${
                          selectedLead.stage_id === stage.id
                            ? 'border-gray-300 text-gray-700 bg-gray-100'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        } disabled:opacity-50`}
                        style={selectedLead.stage_id === stage.id ? { borderColor: stage.color, color: stage.color, backgroundColor: `${stage.color}10` } : {}}
                      >
                        {stage.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href="/conversations"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--sidebar)] text-white text-[13px] font-medium hover:bg-[var(--sidebar-hover)] transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Abrir Conversa
                  </a>
                  <a
                    href={`https://wa.me/${selectedLead.wa_id}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[13px] font-medium hover:bg-emerald-600 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
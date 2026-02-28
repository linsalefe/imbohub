'use client';

import { useEffect, useState } from 'react';
import {
  Bot, Upload, Trash2, Save, FileText, Settings, ToggleLeft, ToggleRight,
  Loader2, CheckCircle, AlertCircle, ChevronDown, Sparkles, Database
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';

interface ChannelInfo {
  id: number;
  name: string;
  phone_number: string;
}

interface AIConfigData {
  id?: number;
  channel_id: number;
  is_enabled: boolean;
  system_prompt: string;
  model: string;
  temperature: string;
  max_tokens: number;
}

interface DocumentInfo {
  title: string;
  chunks: number;
  total_tokens: number;
  created_at: string | null;
}

export default function AIConfigPage() {
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChannelInfo | null>(null);
  const [showChannelMenu, setShowChannelMenu] = useState(false);
  const [config, setConfig] = useState<AIConfigData | null>(null);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [deletingDoc, setDeletingDoc] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (activeChannel) {
      loadConfig();
      loadDocuments();
    }
  }, [activeChannel]);

  const loadChannels = async () => {
    try {
      const res = await api.get('/channels');
      setChannels(res.data);
      const aiChannel = res.data.find((c: ChannelInfo) => c.id === 2);
      setActiveChannel(aiChannel || res.data[0] || null);
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const loadConfig = async () => {
    if (!activeChannel) return;
    setLoading(true);
    try {
      const res = await api.get(`/ai/config/${activeChannel.id}`);
      setConfig(res.data);
    } catch (err) {
      console.error('Erro ao carregar config:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!activeChannel) return;
    try {
      const res = await api.get(`/ai/documents/${activeChannel.id}`);
      setDocuments(res.data);
    } catch (err) {
      console.error('Erro ao carregar docs:', err);
    }
  };

  const saveConfig = async () => {
    if (!activeChannel || !config) return;
    setSaving(true);
    setSaved(false);
    try {
      await api.put(`/ai/config/${activeChannel.id}`, {
        is_enabled: config.is_enabled,
        system_prompt: config.system_prompt,
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!activeChannel || !uploadFile || !uploadTitle.trim()) return;
    setUploading(true);
    setUploadSuccess('');
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle.trim());
      formData.append('file', uploadFile);
      const res = await api.post(`/ai/documents/${activeChannel.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccess(`"${uploadTitle}" enviado com sucesso! ${res.data.chunks_saved} chunks criados (${res.data.total_tokens} tokens)`);
      setUploadTitle('');
      setUploadFile(null);
      const fileInput = document.getElementById('doc-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      loadDocuments();
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (title: string) => {
    if (!activeChannel) return;
    if (!confirm(`Excluir o documento "${title}" e todos os seus chunks?`)) return;
    setDeletingDoc(title);
    try {
      await api.delete(`/ai/documents/${activeChannel.id}/${encodeURIComponent(title)}`);
      loadDocuments();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    } finally {
      setDeletingDoc('');
    }
  };

  if (!mounted) return null;

  const totalTokens = documents.reduce((sum, d) => sum + d.total_tokens, 0);
  const totalChunks = documents.reduce((sum, d) => sum + d.chunks, 0);

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: 'var(--primary-light)' }}
              >
                <Bot className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Configuração da IA</h1>
                <p className="text-[13px] text-gray-400">Configure o agente Nat para atendimento automático</p>
              </div>
            </div>

            {/* Seletor de Canal */}
            <div className="relative">
              <button
                onClick={() => setShowChannelMenu(!showChannelMenu)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-100 text-[13px] font-medium text-gray-700 hover:border-gray-300 transition-all shadow-sm"
              >
                <Bot className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                {activeChannel?.name || 'Selecionar canal'}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showChannelMenu ? 'rotate-180' : ''}`} />
              </button>
              {showChannelMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden min-w-[220px]">
                  {channels.map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => { setActiveChannel(ch); setShowChannelMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-[13px] text-left text-gray-700"
                      style={activeChannel?.id === ch.id ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary)' } : {}}
                    >
                      <Bot className="w-4 h-4" />
                      {ch.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          ) : config && (
            <>
              {/* Toggle Principal */}
              <div
                className="rounded-2xl border p-5 transition-all"
                style={config.is_enabled
                  ? { backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary)' }
                  : { backgroundColor: '#fff', borderColor: '#e5e7eb' }
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: config.is_enabled ? 'var(--primary-light)' : '#f3f4f6' }}
                    >
                      <Sparkles
                        className="w-5 h-5"
                        style={{ color: config.is_enabled ? 'var(--primary)' : '#9ca3af' }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>
                        {config.is_enabled ? '🤖 Agente Nat Ativo' : 'Agente Nat Desativado'}
                      </p>
                      <p className="text-[12px] text-gray-400">
                        {config.is_enabled
                          ? 'A IA está respondendo automaticamente neste canal'
                          : 'Ative para a IA começar a atender neste canal'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, is_enabled: !config.is_enabled })}
                    className="flex-shrink-0"
                  >
                    {config.is_enabled
                      ? <ToggleRight className="w-12 h-7 text-emerald-500" />
                      : <ToggleLeft className="w-12 h-7 text-gray-300" />}
                  </button>
                </div>
              </div>

              {/* Configurações do Modelo */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">Configurações do Modelo</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Modelo</label>
                    <select
                      value={config.model}
                      onChange={e => setConfig({ ...config, model: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent"
                    >
                      <option value="gpt-5">GPT-5</option>
                      <option value="gpt-5-mini">GPT-5 Mini</option>
                      <option value="gpt-5.1">GPT-5.1</option>
                      <option value="gpt-5.2">GPT-5.2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Temperatura</label>
                    <select
                      value={config.temperature}
                      onChange={e => setConfig({ ...config, temperature: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent"
                    >
                      <option value="0.3">0.3 — Preciso</option>
                      <option value="0.5">0.5 — Balanceado</option>
                      <option value="0.7">0.7 — Natural</option>
                      <option value="0.9">0.9 — Criativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Max Tokens</label>
                    <select
                      value={config.max_tokens}
                      onChange={e => setConfig({ ...config, max_tokens: parseInt(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent"
                    >
                      <option value={300}>300 — Curto</option>
                      <option value={500}>500 — Médio</option>
                      <option value={800}>800 — Longo</option>
                      <option value={1000}>1000 — Detalhado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Prompt do Sistema */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-gray-400" />
                  <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">Personalidade da Nat</p>
                </div>
                <p className="text-[12px] text-gray-400">
                  Defina como a Nat deve se comportar, o tom de voz, regras e limites do atendimento.
                </p>
                <textarea
                  value={config.system_prompt}
                  onChange={e => setConfig({ ...config, system_prompt: e.target.value })}
                  rows={10}
                  placeholder="Ex: Você é a assistente virtual da instituição. Seja cordial, profissional e objetiva..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent resize-none leading-relaxed"
                />
                <div className="text-right text-[11px] text-gray-400">
                  {config.system_prompt?.length || 0} caracteres
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="flex items-center justify-end gap-3">
                {saved && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[13px]">
                    <CheckCircle className="w-4 h-4" />
                    Salvo com sucesso!
                  </div>
                )}
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-[13px] font-medium transition-all shadow-sm disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>

              {/* BASE DE CONHECIMENTO (RAG) */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: 'var(--primary-light)' }}
                    >
                      <Database className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Base de Conhecimento</h2>
                      <p className="text-[12px] text-gray-400">
                        Documentos que a Nat usa para responder ({documents.length} docs · {totalChunks} chunks · {totalTokens.toLocaleString()} tokens)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 mb-4">
                  <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">Enviar novo documento</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Título do documento</label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={e => setUploadTitle(e.target.value)}
                        placeholder="Ex: Catálogo de Imóveis - Centro"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-gray-500 mb-1.5">Arquivo (.txt, .md, .csv)</label>
                      <input
                        id="doc-file"
                        type="file"
                        accept=".txt,.md,.csv"
                        onChange={e => setUploadFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {uploadSuccess && (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-[12px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {uploadSuccess}
                        </div>
                      )}
                      {uploadError && (
                        <div className="flex items-center gap-1.5 text-red-500 text-[12px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {uploadError}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={uploading || !uploadTitle.trim() || !uploadFile}
                      className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-[13px] font-medium transition-all shadow-sm disabled:opacity-50 hover:opacity-90"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploading ? 'Processando...' : 'Enviar e Processar'}
                    </button>
                  </div>
                </div>

                {/* Lista de Documentos */}
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div
                        key={doc.title}
                        className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'var(--primary-light)' }}
                          >
                            <FileText className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{doc.title}</p>
                            <p className="text-[11px] text-gray-400">
                              {doc.chunks} chunks · {doc.total_tokens.toLocaleString()} tokens
                              {doc.created_at && ` · ${new Date(doc.created_at).toLocaleDateString('pt-BR')}`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteDocument(doc.title)}
                          disabled={deletingDoc === doc.title}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          {deletingDoc === doc.title
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-[13px]">Nenhum documento na base de conhecimento</p>
                    <p className="text-[11px] mt-1">Envie documentos sobre imóveis, preços e FAQ para a Nat usar nas respostas</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
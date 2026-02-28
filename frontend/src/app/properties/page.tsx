'use client';
import { useEffect, useState, useRef } from 'react';
import {
  Building2, Plus, Search, RefreshCw, Loader2, X, Check,
  Bed, Bath, Car, Maximize, MapPin, DollarSign, Phone,
  Pencil, Trash2, Eye, ChevronDown, Home, Store, Trees, Landmark,
  Users, Filter, Camera, ChevronLeft, ChevronRight, Upload, ImagePlus
} from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import api from '@/lib/api';
import GoogleMap from '@/components/GoogleMap';

interface Property {
  id: number;
  title: string;
  type: string;
  transaction_type: string;
  status: string;
  price: number | null;
  condo_fee: number | null;
  iptu: number | null;
  area_total: number | null;
  area_built: number | null;
  bedrooms: number;
  bathrooms: number;
  parking_spots: number;
  suites: number;
  description: string | null;
  address_street: string | null;
  address_number: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  full_address: string;
  latitude: number | null;
  longitude: number | null;
  photos: string[];
  features: string[];
  notes: string | null;
  interests_count: number;
  nearby_places: { id: number; category: string; name: string; address: string; distance_meters: number; duration_walking: string; latitude: number; longitude: number; rating: number | null }[];
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const typeLabels: Record<string, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  comercial: 'Comercial',
  rural: 'Rural',
};

const typeIcons: Record<string, any> = {
  apartamento: Building2,
  casa: Home,
  terreno: Trees,
  comercial: Store,
  rural: Landmark,
};

const transactionLabels: Record<string, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
  ambos: 'Venda e Aluguel',
};

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  disponivel: { label: 'Disponível', color: '#10b981', bg: 'bg-emerald-50' },
  reservado: { label: 'Reservado', color: '#f59e0b', bg: 'bg-amber-50' },
  vendido: { label: 'Vendido', color: '#6366f1', bg: 'bg-indigo-50' },
  alugado: { label: 'Alugado', color: '#8b5cf6', bg: 'bg-purple-50' },
  inativo: { label: 'Inativo', color: '#64748b', bg: 'bg-gray-50' },
};

const featuresList = [
  'Piscina', 'Churrasqueira', 'Academia', 'Salão de festas',
  'Playground', 'Portaria 24h', 'Elevador', 'Varanda gourmet',
  'Jardim', 'Quadra esportiva', 'Sauna', 'Ar condicionado',
  'Mobiliado', 'Pet friendly', 'Coworking', 'Bicicletário',
];

const defaultForm = {
  title: '',
  type: 'apartamento',
  transaction_type: 'venda',
  status: 'disponivel',
  price: '',
  condo_fee: '',
  iptu: '',
  area_total: '',
  area_built: '',
  bedrooms: 0,
  bathrooms: 0,
  parking_spots: 0,
  suites: 0,
  description: '',
  address_street: '',
  address_number: '',
  address_complement: '',
  address_neighborhood: '',
  address_city: '',
  address_state: '',
  address_zip: '',
  features: [] as string[],
  notes: '',
};

function PhotoUrl(path: string) {
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTransaction, setFilterTransaction] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);

  // Photo states
  const [uploading, setUploading] = useState(false);
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProperties = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterTransaction) params.transaction_type = filterTransaction;
      const res = await api.get('/properties', { params });
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [filterType, filterStatus, filterTransaction]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    loadProperties();
  };

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setEditPhotos([]);
    setShowModal(true);
  };

  const openEdit = (p: Property) => {
    setForm({
      title: p.title,
      type: p.type,
      transaction_type: p.transaction_type,
      status: p.status,
      price: p.price?.toString() || '',
      condo_fee: p.condo_fee?.toString() || '',
      iptu: p.iptu?.toString() || '',
      area_total: p.area_total?.toString() || '',
      area_built: p.area_built?.toString() || '',
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      parking_spots: p.parking_spots,
      suites: p.suites,
      description: p.description || '',
      address_street: p.address_street || '',
      address_number: p.address_number || '',
      address_complement: '',
      address_neighborhood: p.address_neighborhood || '',
      address_city: p.address_city || '',
      address_state: p.address_state || '',
      address_zip: p.address_zip || '',
      features: p.features || [],
      notes: p.notes || '',
    });
    setEditingId(p.id);
    setEditPhotos(p.photos || []);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Título é obrigatório');
    setSaving(true);

    const payload: any = {
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      condo_fee: form.condo_fee ? parseFloat(form.condo_fee) : null,
      iptu: form.iptu ? parseFloat(form.iptu) : null,
      area_total: form.area_total ? parseFloat(form.area_total) : null,
      area_built: form.area_built ? parseFloat(form.area_built) : null,
    };

    try {
      let propId = editingId;
      if (editingId) {
        await api.patch(`/properties/${editingId}`, payload);
      } else {
        const res = await api.post('/properties', payload);
        propId = res.data.id;
        setEditingId(propId);
      }
      // Upload pending files if any
      if (fileInputRef.current?.files?.length && propId) {
        await uploadPhotos(propId, fileInputRef.current.files);
      }
      setShowModal(false);
      setLoading(true);
      loadProperties();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const uploadPhotos = async (propertyId: number, files: FileList) => {
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('files', f));

      const res = await api.post(`/properties/${propertyId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditPhotos(res.data.photos);
      return res.data;
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (editingId) {
      // Imóvel já existe, upload direto
      await uploadPhotos(editingId, files);
      loadProperties();
    }
    // Se está criando, o upload será feito no handleSave
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    if (!editingId) return;
    try {
      await api.delete(`/properties/${editingId}/photos`, { params: { photo_url: photoUrl } });
      setEditPhotos(prev => prev.filter(p => p !== photoUrl));
      loadProperties();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao remover foto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setLoading(true);
      loadProperties();
      if (selectedProperty?.id === id) setSelectedProperty(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao excluir');
    }
  };

  const toggleFeature = (f: string) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter(x => x !== f)
        : [...prev.features, f],
    }));
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <AppLayout>
      <div className="flex-1 bg-[#f8f9fb] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-start lg:items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-[#27273D]">Imóveis</h1>
                <p className="text-[12px] text-gray-400">
                  {properties.length} imóveis cadastrados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <form onSubmit={handleSearch} className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar imóvel..."
                  className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-[13px] bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 w-40 lg:w-52"
                />
              </form>

              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-[13px] font-medium hover:opacity-90 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden lg:inline">Novo Imóvel</span>
              </button>

              <button
                onClick={() => { setLoading(true); loadProperties(); }}
                className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value); }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>

            <select
              value={filterTransaction}
              onChange={e => { setFilterTransaction(e.target.value); }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Venda e Aluguel</option>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">Todos os status</option>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Building2 className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Nenhum imóvel cadastrado</h3>
              <p className="text-[13px] text-gray-400 mb-4">Comece cadastrando seu primeiro imóvel</p>
              <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600 transition-all">
                <Plus className="w-4 h-4" />
                Cadastrar imóvel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {properties.map(p => {
                const StatusInfo = statusLabels[p.status] || statusLabels.disponivel;
                const TypeIcon = typeIcons[p.type] || Building2;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                  >
                    {/* Photo/Placeholder */}
                    <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center relative overflow-hidden">
                      {p.photos && p.photos.length > 0 ? (
                        <img src={PhotoUrl(p.photos[0])} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <TypeIcon className="w-12 h-12 text-gray-300" />
                      )}

                      {/* Photo count */}
                      {p.photos && p.photos.length > 1 && (
                        <span className="absolute bottom-3 left-3 text-[10px] font-semibold px-2 py-1 rounded-lg bg-black/50 text-white flex items-center gap-1">
                          <Camera className="w-3 h-3" /> {p.photos.length}
                        </span>
                      )}

                      {/* Status badge */}
                      <span
                        className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-1 rounded-lg"
                        style={{ backgroundColor: `${StatusInfo.color}15`, color: StatusInfo.color }}
                      >
                        {StatusInfo.label}
                      </span>

                      {/* Transaction badge */}
                      <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/90 text-gray-700">
                        {transactionLabels[p.transaction_type] || p.transaction_type}
                      </span>

                      {/* Actions on hover */}
                      <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={async () => { 
                            setGalleryIndex(0); 
                            try { 
                              const res = await api.get(`/properties/${p.id}`); 
                              setSelectedProperty(res.data); 
                            } catch { 
                              setSelectedProperty(p); 
                            } 
                          }}
                          className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white shadow-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-lg bg-white/90 text-red-500 hover:bg-white shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-[14px] font-semibold text-gray-800 line-clamp-1">{p.title}</h3>
                      </div>

                      {p.full_address && (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1 mb-3">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{p.full_address}</span>
                        </p>
                      )}

                      <p className="text-[18px] font-bold text-blue-600 mb-3">
                        {formatCurrency(p.price)}
                        {p.transaction_type === 'aluguel' && <span className="text-[11px] text-gray-400 font-normal">/mês</span>}
                      </p>

                      {/* Specs */}
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        {p.bedrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5" /> {p.bedrooms}
                          </span>
                        )}
                        {p.bathrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5" /> {p.bathrooms}
                          </span>
                        )}
                        {p.parking_spots > 0 && (
                          <span className="flex items-center gap-1">
                            <Car className="w-3.5 h-3.5" /> {p.parking_spots}
                          </span>
                        )}
                        {p.area_total && (
                          <span className="flex items-center gap-1">
                            <Maximize className="w-3.5 h-3.5" /> {p.area_total}m²
                          </span>
                        )}
                        {p.interests_count > 0 && (
                          <span className="flex items-center gap-1 ml-auto text-blue-500 font-medium">
                            <Users className="w-3.5 h-3.5" /> {p.interests_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-2xl w-[calc(100vw-2rem)] lg:w-[700px] max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
                <h2 className="text-[16px] font-bold text-gray-900">
                  {editingId ? 'Editar Imóvel' : 'Novo Imóvel'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* === FOTOS === */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Fotos</label>
                  <div className="flex flex-wrap gap-2">
                    {editPhotos.map((photo, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={PhotoUrl(photo)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleDeletePhoto(photo)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      ) : (
                        <>
                          <ImagePlus className="w-5 h-5 text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-400">Adicionar</span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>
                  {!editingId && (
                    <p className="text-[10px] text-gray-400 mt-1">As fotos serão enviadas após salvar o imóvel</p>
                  )}
                </div>

                {/* Título */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Título do anúncio</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Apartamento 3 quartos na Vila Mariana"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Tipo + Transação + Status */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Tipo</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Transação</label>
                    <select
                      value={form.transaction_type}
                      onChange={e => setForm({ ...form, transaction_type: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="venda">Venda</option>
                      <option value="aluguel">Aluguel</option>
                      <option value="ambos">Ambos</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Preço (R$)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="350000"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Condomínio</label>
                    <input
                      type="number"
                      value={form.condo_fee}
                      onChange={e => setForm({ ...form, condo_fee: e.target.value })}
                      placeholder="500"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">IPTU</label>
                    <input
                      type="number"
                      value={form.iptu}
                      onChange={e => setForm({ ...form, iptu: e.target.value })}
                      placeholder="200"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Quartos', key: 'bedrooms' },
                    { label: 'Suítes', key: 'suites' },
                    { label: 'Banheiros', key: 'bathrooms' },
                    { label: 'Vagas', key: 'parking_spots' },
                    { label: 'Área total m²', key: 'area_total' },
                    { label: 'Área útil m²', key: 'area_built' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">{f.label}</label>
                      <input
                        type="number"
                        value={(form as any)[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: f.key.includes('area') ? e.target.value : parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] text-center focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  ))}
                </div>

                {/* Endereço */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Endereço</label>
                  <div className="grid grid-cols-6 gap-2">
                    <input value={form.address_street} onChange={e => setForm({ ...form, address_street: e.target.value })} placeholder="Rua" className="col-span-4 px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    <input value={form.address_number} onChange={e => setForm({ ...form, address_number: e.target.value })} placeholder="Nº" className="col-span-1 px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    <input value={form.address_complement} onChange={e => setForm({ ...form, address_complement: e.target.value })} placeholder="Comp." className="col-span-1 px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    <input value={form.address_neighborhood} onChange={e => setForm({ ...form, address_neighborhood: e.target.value })} placeholder="Bairro" className="col-span-2 px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    <input value={form.address_city} onChange={e => setForm({ ...form, address_city: e.target.value })} placeholder="Cidade" className="col-span-2 px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    <input value={form.address_state} onChange={e => setForm({ ...form, address_state: e.target.value })} placeholder="UF" maxLength={2} className="col-span-1 px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 uppercase" />
                    <input value={form.address_zip} onChange={e => setForm({ ...form, address_zip: e.target.value })} placeholder="CEP" className="col-span-1 px-3 py-2 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Descrição</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Descreva o imóvel..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  />
                </div>

                {/* Características */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Características</label>
                  <div className="flex flex-wrap gap-2">
                    {featuresList.map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => toggleFeature(f)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                          form.features.includes(f)
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Observações internas</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    placeholder="Notas internas (não visíveis ao cliente)..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-all">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editingId ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedProperty(null)}>
            <div className="bg-white rounded-2xl w-[calc(100vw-2rem)] lg:w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              
              {/* Photo Gallery */}
              {selectedProperty.photos.length > 0 && (
                <div className="relative h-64 bg-gray-100">
                  <img
                    src={PhotoUrl(selectedProperty.photos[galleryIndex])}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedProperty.photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setGalleryIndex(i => i > 0 ? i - 1 : selectedProperty.photos.length - 1); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setGalleryIndex(i => i < selectedProperty.photos.length - 1 ? i + 1 : 0); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <span className="absolute bottom-3 right-3 text-[11px] font-medium px-2 py-1 rounded-lg bg-black/40 text-white">
                        {galleryIndex + 1} / {selectedProperty.photos.length}
                      </span>
                    </>
                  )}
                  {/* Thumbnails */}
                  {selectedProperty.photos.length > 1 && (
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      {selectedProperty.photos.slice(0, 6).map((photo, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setGalleryIndex(idx); }}
                          className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === galleryIndex ? 'border-white' : 'border-transparent opacity-70'
                          }`}
                        >
                          <img src={PhotoUrl(photo)} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-[18px] font-bold text-gray-900">{selectedProperty.title}</h2>
                    {selectedProperty.full_address && (
                      <p className="text-[12px] text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {selectedProperty.full_address}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setSelectedProperty(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>

                {/* Price */}
                <p className="text-[24px] font-bold text-blue-600">
                  {formatCurrency(selectedProperty.price)}
                  {selectedProperty.transaction_type === 'aluguel' && <span className="text-[13px] text-gray-400 font-normal">/mês</span>}
                </p>

                {/* Costs */}
                {(selectedProperty.condo_fee || selectedProperty.iptu) && (
                  <div className="flex gap-4 text-[12px] text-gray-500">
                    {selectedProperty.condo_fee && <span>Condomínio: {formatCurrency(selectedProperty.condo_fee)}</span>}
                    {selectedProperty.iptu && <span>IPTU: {formatCurrency(selectedProperty.iptu)}</span>}
                  </div>
                )}

                {/* Specs grid */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: Bed, label: 'Quartos', value: selectedProperty.bedrooms },
                    { icon: Bath, label: 'Banheiros', value: selectedProperty.bathrooms },
                    { icon: Car, label: 'Vagas', value: selectedProperty.parking_spots },
                    { icon: Maximize, label: 'Área', value: selectedProperty.area_total ? `${selectedProperty.area_total}m²` : '—' },
                  ].map((s, i) => (
                    <div key={i} className="text-center py-3 rounded-xl bg-gray-50">
                      <s.icon className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                      <p className="text-[14px] font-bold text-gray-800">{s.value}</p>
                      <p className="text-[10px] text-gray-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {selectedProperty.description && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Descrição</p>
                    <p className="text-[13px] text-gray-600 leading-relaxed">{selectedProperty.description}</p>
                  </div>
                )}

                {/* Features */}
                {selectedProperty.features.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Características</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProperty.features.map((f, i) => (
                        <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium">{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map + Nearby Places */}
                {selectedProperty.latitude && selectedProperty.longitude && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Localização</p>
                    <GoogleMap
                      latitude={selectedProperty.latitude}
                      longitude={selectedProperty.longitude}
                      height="250px"
                      markers={(selectedProperty as any).nearby_places?.map((p: any) => ({
                        lat: p.latitude || 0,
                        lng: p.longitude || 0,
                        title: `${p.name} (${p.distance_meters}m)`,
                        color: ({
                          escola: '#f59e0b',
                          hospital: '#ef4444',
                          supermercado: '#10b981',
                          metro: '#6366f1',
                          parque: '#22c55e',
                          banco: '#64748b',
                          restaurante: '#f97316',
                        } as Record<string, string>)[p.category as string] || '#6366f1',
                      })).filter((m: any) => m.lat && m.lng) || []}
                    />
                  </div>
                )}

                {/* Nearby Places List */}
                {(selectedProperty as any).nearby_places?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">O que tem por perto</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {(selectedProperty as any).nearby_places.map((p: any) => (
                        <div key={p.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50">
                          <span className="text-[14px]">
                            {({ escola: '🏫', hospital: '🏥', supermercado: '🛒', metro: '🚇', parque: '🌳', banco: '🏦', restaurante: '🍽️' } as Record<string, string>)[p.category as string] || '📍'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-gray-700 truncate">{p.name}</p>
                            <p className="text-[10px] text-gray-400">{p.category} · {p.distance_meters}m · {p.duration_walking}</p>
                          </div>
                          {p.rating && (
                            <span className="text-[11px] font-medium text-amber-500">⭐ {p.rating}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { openEdit(selectedProperty); setSelectedProperty(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0f1b2d] text-white text-[13px] font-medium hover:bg-[#1a2d42] transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => { handleDelete(selectedProperty.id); }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-[13px] font-medium hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
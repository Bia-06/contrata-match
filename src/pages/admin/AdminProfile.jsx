import React, { useState, useEffect, useRef } from 'react';
import { Store, Upload, Mail, Phone, MapPin, Building2, Save, Globe, Camera, Loader2, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { dataService } from './services/dataService';
import { supabase } from '../../lib/supabaseClient';

// Lista de segmentos pré-definidos
const PREDEFINED_SEGMENTS = [
  'Restaurante', 'Bar / Pub', 'Cafeteria', 'Hotel', 
  'Buffet / Eventos', 'Padaria / Confeitaria', 
  'Lanchonete / Delivery', 'Pizzaria', 'Hamburgueria'
];

export const AdminProfile = ({ user, showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState(null);
  
  // Estado para upload de logo
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Controle de Segmentos (Múltipla Seleção)
  const [selectedSegments, setSelectedSegments] = useState([]); // Array de strings
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customSegment, setCustomSegment] = useState('');
  
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '', description: '', website: '', size: '',
  });

  useEffect(() => {
    if (!user?.companyId) return;
    const load = async () => {
      try {
        const data = await dataService.getCompanyProfile(user.companyId);
        if (data) {
          setCompany(data);
          
          // Lógica para carregar segmentos salvos (string separada por vírgula)
          const savedSegments = data.segment ? data.segment.split(',').map(s => s.trim()) : [];
          
          // Separa o que é padrão do que é personalizado
          const predefinedFound = savedSegments.filter(s => PREDEFINED_SEGMENTS.includes(s));
          const othersFound = savedSegments.filter(s => !PREDEFINED_SEGMENTS.includes(s));

          setSelectedSegments(predefinedFound);
          
          if (othersFound.length > 0) {
            setIsOtherSelected(true);
            setCustomSegment(othersFound.join(', '));
          }

          setForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            location: data.location || '',
            description: data.description || '',
            website: data.website || '',
            size: data.size || '',
          });
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.companyId]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  // Máscara de Telefone
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    if (value.length > 15) value = value.substring(0, 15);
    setForm(prev => ({ ...prev, phone: value }));
  };

  // Toggle Checkbox de Segmentos
  const toggleSegment = (seg) => {
    setSelectedSegments(prev => 
      prev.includes(seg) 
        ? prev.filter(s => s !== seg) 
        : [...prev, seg]
    );
  };

  // Handler de Imagem (Preview)
  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) { 
      showToast('A imagem deve ter no máximo 2MB.');
      return;
    }

    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let finalLogoPath = company?.logo_path;

      // 1. Upload Logo
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.companyId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);
          
        finalLogoPath = publicUrl;
      }

      // 2. Processar Segmentos para salvar como string
      let finalSegments = [...selectedSegments];
      if (isOtherSelected && customSegment.trim()) {
        finalSegments.push(customSegment.trim());
      }
      const segmentString = finalSegments.join(', ');

      // 3. Salva no banco
      const updated = await dataService.updateCompanyProfile(user.companyId, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        website: form.website.trim() || null,
        segment: segmentString, // Salva string concatenada
        size: form.size || null,
        logo_path: finalLogoPath 
      });

      setCompany(updated);
      setLogoFile(null); 
      showToast('Informações salvas com sucesso!');
      
    } catch (err) {
      console.error('Erro ao salvar:', err);
      if (err.message && err.message.includes('row-level security')) {
         showToast('Erro de permissão. Verifique o bucket "logos".');
      } else {
         showToast('Erro ao salvar alterações.');
      }
    } finally {
      setSaving(false);
    }
  };

  const formatCnpj = (raw) => {
    if (!raw) return '—';
    const d = raw.replace(/\D/g, '');
    if (d.length !== 14) return raw;
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={40} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="animate-[fadeInUp_0.5s_ease-out_forwards] pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-emerald-950 mb-2">Perfil da Empresa</h1>
        <p className="text-emerald-900/60">Gerencie as informações públicas do seu estabelecimento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLUNA ESQUERDA: CARD DE PREVIEW */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm text-center sticky top-8">
            <div className="relative inline-block mb-6 group">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-3xl overflow-hidden bg-emerald-50 border-4 border-white shadow-lg mx-auto flex items-center justify-center cursor-pointer relative"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : company?.logo_path ? (
                  <img src={company.logo_path} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={48} className="text-emerald-300" />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white" size={32} />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
              <p className="text-xs text-emerald-900/40 mt-2">Clique para alterar a logo</p>
            </div>

            <h2 className="text-xl font-bold text-emerald-950 mb-1">{form.name || 'Sua Empresa'}</h2>
            <p className="text-sm text-emerald-900/40 font-medium mb-6">{formatCnpj(company?.cnpj)}</p>

            <div className="space-y-4 text-left">
              {[
                { icon: Mail, value: form.email },
                { icon: Phone, value: form.phone },
                { icon: MapPin, value: form.location },
                { icon: Globe, value: form.website },
              ].map((item, i) => item.value && (
                <div key={i} className="flex items-center gap-3 text-sm text-emerald-900/70 p-3 bg-stone-50 rounded-xl overflow-hidden">
                  <item.icon size={16} className="text-emerald-900/40 shrink-0" />
                  <span className="truncate">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm">
            <h3 className="text-lg font-bold text-emerald-950 mb-6 pb-4 border-b border-stone-100">Editar Informações</h3>

            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Infos Básicas */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Nome Fantasia" value={form.name} onChange={set('name')} required />
                  <Input label="CNPJ" value={formatCnpj(company?.cnpj)} disabled className="bg-stone-50 text-stone-500 opacity-70 cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="E-mail Público" type="email" value={form.email} onChange={set('email')} />
                  <Input label="Telefone / WhatsApp" value={form.phone} onChange={handlePhoneChange} placeholder="(00) 00000-0000" maxLength={15} />
                </div>
                <Input label="Endereço Completo" value={form.location} onChange={set('location')} placeholder="Rua, Bairro, Cidade - UF" />
                <Input label="Website / Instagram" value={form.website} onChange={set('website')} placeholder="https://..." />
              </div>

              <div className="border-t border-stone-100 my-6"></div>

              {/* SEGMENTOS (CHECKBOXES) */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-emerald-950 mb-2">Segmentos (Selecione todos que se aplicam)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PREDEFINED_SEGMENTS.map((seg) => {
                    const isSelected = selectedSegments.includes(seg);
                    return (
                      <div 
                        key={seg}
                        onClick={() => toggleSegment(seg)}
                        className={`
                          cursor-pointer px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 select-none
                          ${isSelected 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-stone-50'}
                        `}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                          {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                        </div>
                        {seg}
                      </div>
                    );
                  })}

                  {/* Opção Outro */}
                  <div 
                    onClick={() => setIsOtherSelected(!isOtherSelected)}
                    className={`
                      cursor-pointer px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 select-none
                      ${isOtherSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-200 hover:bg-stone-50'}
                    `}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isOtherSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white'}`}>
                      {isOtherSelected && <Check size={12} className="text-white stroke-[3]" />}
                    </div>
                    Outro / Personalizado
                  </div>
                </div>

                {/* Input Condicional para 'Outro' */}
                {isOtherSelected && (
                  <div className="mt-3 animate-[fadeIn_0.3s_ease-out]">
                    <Input 
                      placeholder="Especifique outros segmentos (ex: Temakeria, Açaí...)" 
                      value={customSegment} 
                      onChange={(e) => setCustomSegment(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* PORTE */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-emerald-950">Porte da Equipe</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'micro', label: 'Micro (até 9)' },
                    { value: 'pequena', label: 'Pequena (10-49)' },
                    { value: 'media', label: 'Média (50-99)' },
                    { value: 'grande', label: 'Grande (100+)' },
                  ].map(opt => (
                    <button 
                      key={opt.value} 
                      type="button" 
                      onClick={() => setForm(p => ({ ...p, size: opt.value }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${form.size === opt.value ? 'bg-emerald-900 text-white border-emerald-900 shadow-md' : 'bg-white text-emerald-900/60 border-emerald-100 hover:border-emerald-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <TextArea label="Sobre o estabelecimento" rows={5} value={form.description} onChange={set('description')} placeholder="Conte um pouco sobre a história..." />

              <div className="flex justify-end pt-6 border-t border-stone-100">
                <Button type="submit" size="lg" className="flex items-center gap-2 shadow-xl shadow-emerald-900/10" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {saving ? 'Salvando...' : 'Salvar Perfil'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
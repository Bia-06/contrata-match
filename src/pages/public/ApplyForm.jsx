// src/pages/public/ApplyForm.jsx
import React, { useState, useRef } from 'react';
import {
  ChevronLeft, Upload, Loader2, MapPin, DollarSign, Calendar, Clock,
  Check, FileText, X, AlertTriangle, Briefcase, User, Mail, Phone,
  Building2, Send, Users
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { publicService } from '../../services/publicService';

// ── Helpers de formatação ──
const formatSchedule = (schedule) => {
  const map = {
    'integral': 'Integral', 'noturno': 'Noturno', 'diurno': 'Diurno',
    'tarde': 'Tarde/Noite', 'escala_6x1': 'Escala 6x1',
    'escala_12x36': 'Escala 12x36', 'flexivel': 'Flexível',
  };
  return map[schedule] || schedule || null;
};

const formatAgeRange = (age) => {
  const map = {
    '18-25': '18 a 25 anos', '26-35': '26 a 35 anos',
    '36-45': '36 a 45 anos', '46+': 'Acima de 46',
  };
  return map[age] || age || null;
};

const formatContractLabel = (type) => {
  const map = { clt: 'CLT', pj: 'PJ / Freelancer', estagio: 'Estágio', extra: 'Extra (Diária)' };
  return map[type] || type || null;
};

// ── Máscara de telefone (14) 99999-9999 ──
const maskPhone = (value) => {
  let digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

// ── Máscara de moeda R$ 1.234,56 ──
const maskCurrency = (value) => {
  let digits = value.replace(/\D/g, '');
  if (!digits) return '';
  let num = (parseInt(digits) / 100).toFixed(2);
  num = num.replace('.', ',');
  num = num.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return `R$ ${num}`;
};

export const ApplyForm = ({ selectedJob, onNavigate, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [consentLgpd, setConsentLgpd] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    city: '',
    neighborhood: '',
    experience: '',
    salary: '',
    availability: '',
  });

  if (!selectedJob) return null;

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handlePhoneChange = (e) => {
    setForm(prev => ({ ...prev, phone: maskPhone(e.target.value) }));
  };

  const handleSalaryChange = (e) => {
    setForm(prev => ({ ...prev, salary: maskCurrency(e.target.value) }));
  };

  const handleAgeChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
    setForm(prev => ({ ...prev, age: digits }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Apenas arquivos PDF são aceitos.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('O arquivo deve ter no máximo 5 MB.'); return; }
    setResumeFile(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações obrigatórias
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return; }
    if (!form.age || parseInt(form.age) < 14 || parseInt(form.age) > 99) { setError('Informe uma idade válida.'); return; }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) { setError('Informe um telefone válido.'); return; }
    if (!form.city) { setError('Selecione sua cidade.'); return; }
    if (!form.availability) { setError('Selecione sua disponibilidade.'); return; }
    if (!consentLgpd) { setError('Você precisa aceitar o termo de consentimento LGPD.'); return; }

    setLoading(true);
    try {
      await publicService.submitApplication({
        jobId: selectedJob.id,
        unitId: selectedJob.unit_id,
        candidateName: form.name.trim(),
        candidateEmail: form.email.trim() || null,
        candidatePhone: form.phone.trim(),
        candidateAge: form.age,
        candidateCity: form.city,
        candidateNeighborhood: form.neighborhood.trim() || null,
        experience: form.experience.trim() || null,
        salaryExpectation: form.salary || null,
        availability: form.availability,
        resumeFile,
        consentLgpd: true,
      });
      showToast('Candidatura enviada com sucesso! 🎉');
      onNavigate('jobs');
    } catch (err) {
      console.error('Erro ao enviar candidatura:', err);
      setError(
        err.message?.includes('row-level security')
          ? 'Esta vaga não está mais aceitando candidaturas.'
          : 'Erro ao enviar candidatura. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Detalhes da vaga (sidebar)
  const jobDetails = [
    { icon: Briefcase, label: 'Contrato', value: formatContractLabel(selectedJob.contract_type) },
    { icon: DollarSign, label: 'Salário', value: selectedJob.salary && selectedJob.salary !== 'A combinar' ? selectedJob.salary : null },
    { icon: Clock, label: 'Período', value: formatSchedule(selectedJob.work_schedule) },
    { icon: MapPin, label: 'Localidade', value: selectedJob.location },
    { icon: Users, label: 'Faixa Etária', value: formatAgeRange(selectedJob.age_range) },
    { icon: Calendar, label: 'Publicada', value: selectedJob.posted },
  ].filter(d => d.value);

  // Classe reutilizável para inputs
  const inputCls = "w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-emerald-950 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all";
  const inputIconCls = "w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-emerald-950 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all";
  const labelCls = "block text-sm font-semibold text-emerald-900/70 mb-1.5";
  const reqMark = <span className="text-orange-500">*</span>;

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navbar minimal onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        {/* Voltar */}
        <button onClick={() => onNavigate('jobs')}
          className="flex items-center text-sm text-emerald-900/40 hover:text-emerald-900 mb-6 transition-colors font-medium group">
          <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-0.5 transition-transform" /> Voltar para vagas
        </button>

        {/* ══ MOBILE: Header compacto ══ */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-emerald-50 border border-emerald-100">
                {selectedJob.companyLogo ? (
                  <img src={selectedJob.companyLogo} alt={selectedJob.company} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="font-serif font-bold text-xl text-emerald-700">{selectedJob.company?.charAt(0) || '?'}</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-emerald-950 leading-tight">{selectedJob.title}</h1>
                <p className="text-emerald-700 font-medium text-sm mt-0.5">{selectedJob.company}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {jobDetails.slice(0, 4).map((d, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-50 rounded-lg text-xs font-medium text-stone-600 border border-stone-100">
                  <d.icon size={11} className="text-emerald-500" /> {d.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ══ LAYOUT 2 COLUNAS (desktop) ══ */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          {/* ── ESQUERDA: Info da vaga (desktop) ── */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-[1.75rem] border border-emerald-100 overflow-hidden shadow-sm">
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 p-6 pb-14 relative">
                  <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-lg uppercase tracking-wide backdrop-blur-sm">
                    {selectedJob.type}
                  </span>
                </div>
                <div className="px-6 -mt-10 relative z-10">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden bg-white border-4 border-white shadow-lg">
                    {selectedJob.companyLogo ? (
                      <img src={selectedJob.companyLogo} alt={selectedJob.company} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                        <span className="font-serif font-bold text-3xl text-emerald-700">{selectedJob.company?.charAt(0) || '?'}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 pt-4 pb-6">
                  <h1 className="text-2xl font-bold text-emerald-950 leading-tight mb-1">{selectedJob.title}</h1>
                  <p className="text-emerald-700 font-semibold">{selectedJob.company}</p>
                </div>
                <div className="border-t border-emerald-50">
                  {jobDetails.map((detail, i) => (
                    <div key={i} className={`flex items-center gap-3 px-6 py-3.5 ${i < jobDetails.length - 1 ? 'border-b border-stone-50' : ''}`}>
                      <div className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center shrink-0">
                        <detail.icon size={15} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{detail.label}</p>
                        <p className="text-sm font-semibold text-emerald-950">{detail.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedJob.description && (
                <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-emerald-950 mb-3 uppercase tracking-wider">Sobre a vaga</h3>
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── DIREITA: Formulário ── */}
          <div className="lg:col-span-8">

            {/* Descrição (mobile) */}
            {selectedJob.description && (
              <div className="lg:hidden mb-6">
                <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-emerald-950 mb-2">Sobre a vaga</h3>
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[1.75rem] border border-emerald-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 lg:px-8 py-6 border-b border-emerald-50 bg-gradient-to-r from-stone-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Send size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-emerald-950">Enviar candidatura</h2>
                    <p className="text-xs text-stone-400 mt-0.5">Campos com * são obrigatórios</p>
                  </div>
                </div>
              </div>

              <div className="px-6 lg:px-8 py-6 lg:py-8">
                {error && (
                  <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 text-red-700 text-sm mb-6 border border-red-100">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                  {/* ── Dados pessoais ── */}
                  <fieldset className="mb-8">
                    <legend className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <User size={13} /> Dados Pessoais
                    </legend>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                      {/* Nome * */}
                      <div className="lg:col-span-2">
                        <label className={labelCls}>Nome completo {reqMark}</label>
                        <input type="text" placeholder="Seu nome completo"
                          value={form.name} onChange={set('name')} className={inputCls} />
                      </div>

                      {/* Idade * */}
                      <div>
                        <label className={labelCls}>Idade {reqMark}</label>
                        <input type="text" inputMode="numeric" placeholder="Ex: 28"
                          value={form.age} onChange={handleAgeChange} maxLength={2}
                          className={inputCls} />
                      </div>

                      {/* Telefone * */}
                      <div>
                        <label className={labelCls}>Telefone / WhatsApp {reqMark}</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                          <input type="tel" placeholder="(14) 99999-9999"
                            value={form.phone} onChange={handlePhoneChange} maxLength={15}
                            className={inputIconCls} />
                        </div>
                      </div>

                      {/* Email (opcional) */}
                      <div>
                        <label className={labelCls}>E-mail <span className="text-stone-300 font-normal">(opcional)</span></label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                          <input type="email" placeholder="seu@email.com"
                            value={form.email} onChange={set('email')}
                            className={inputIconCls} />
                        </div>
                      </div>

                      {/* Cidade * */}
                      <div>
                        <label className={labelCls}>Cidade {reqMark}</label>
                        <select value={form.city} onChange={set('city')}
                          className={`${inputCls} cursor-pointer`}>
                          <option value="">Selecione</option>
                          <option value="Marília">Marília</option>
                          <option value="Garça">Garça</option>
                          <option value="Vera Cruz">Vera Cruz</option>
                          <option value="Outra">Outro</option>
                        </select>
                      </div>

                      {/* Bairro */}
                      <div className="lg:col-span-2">
                        <label className={labelCls}>Bairro <span className="text-stone-300 font-normal">(opcional)</span></label>
                        <input type="text" placeholder="Ex: Centro, Jardim América..."
                          value={form.neighborhood} onChange={set('neighborhood')}
                          className={inputCls} />
                      </div>
                    </div>
                  </fieldset>

                  {/* ── Informações profissionais ── */}
                  <fieldset className="mb-8">
                    <legend className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Briefcase size={13} /> Informações Profissionais
                    </legend>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                      {/* Pretensão salarial (com máscara R$) */}
                      <div>
                        <label className={labelCls}>Pretensão Salarial</label>
                        <div className="relative">
                          <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" />
                          <input type="text" placeholder="R$ 0,00"
                            value={form.salary} onChange={handleSalaryChange}
                            className={inputIconCls} />
                        </div>
                      </div>

                      {/* Disponibilidade * */}
                      <div>
                        <label className={labelCls}>Disponibilidade {reqMark}</label>
                        <select value={form.availability} onChange={set('availability')}
                          className={`${inputCls} cursor-pointer`}>
                          <option value="">Selecione</option>
                          <option value="imediata">Imediata</option>
                          <option value="1_semana">Em 1 semana</option>
                          <option value="2_semanas">Em 2 semanas</option>
                          <option value="1_mes">Em 1 mês</option>
                          <option value="a_combinar">A combinar</option>
                        </select>
                      </div>

                      {/* Experiência */}
                      <div className="lg:col-span-2">
                        <label className={labelCls}>Experiência relevante</label>
                        <textarea
                          placeholder="Conte brevemente sobre sua experiência na área, habilidades e o que te motiva..."
                          rows={4} value={form.experience} onChange={set('experience')}
                          className={`${inputCls} resize-none`} />
                      </div>
                    </div>
                  </fieldset>

                  {/* ── Currículo ── */}
                  <fieldset className="mb-8">
                    <legend className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText size={13} /> Currículo
                    </legend>
                    <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />

                    {resumeFile ? (
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-emerald-800 truncate">{resumeFile.name}</p>
                          <p className="text-xs text-emerald-600/60">{(resumeFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <button type="button" onClick={() => setResumeFile(null)}
                          className="p-2 hover:bg-emerald-100 rounded-lg transition-colors">
                          <X size={16} className="text-emerald-600" />
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:bg-emerald-50/50 hover:border-emerald-300 transition-all cursor-pointer group">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 group-hover:bg-emerald-100 flex items-center justify-center mx-auto mb-3 transition-colors">
                          <Upload className="text-stone-400 group-hover:text-emerald-500 transition-colors" size={22} />
                        </div>
                        <p className="text-sm font-semibold text-stone-500 group-hover:text-emerald-700 transition-colors">
                          Clique para enviar seu currículo
                        </p>
                        <p className="text-xs text-stone-400 mt-1">PDF — máx. 5 MB</p>
                      </div>
                    )}
                  </fieldset>

                  {/* ── LGPD + Submit ── */}
                  <div className="pt-6 border-t border-stone-100 space-y-5">
                    <label className="flex items-start gap-3 cursor-pointer group" onClick={() => setConsentLgpd(!consentLgpd)}>
                      <div className={`w-5 h-5 mt-0.5 rounded-md border-2 transition-all flex items-center justify-center shrink-0 ${consentLgpd ? 'bg-emerald-600 border-emerald-600' : 'border-stone-300 group-hover:border-emerald-400'}`}>
                        {consentLgpd && <Check size={14} className="text-white stroke-[3]" />}
                      </div>
                      <span className="text-xs text-stone-500 leading-relaxed">
                        Autorizo o tratamento dos meus dados pessoais para fins de recrutamento e seleção, conforme a{' '}
                        <span className="text-emerald-700 font-medium">Lei Geral de Proteção de Dados (LGPD){reqMark}</span>.
                      </span>
                    </label>

                    <button type="submit" disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base">
                      {loading ? (
                        <><Loader2 className="animate-spin" size={20} /> Enviando...</>
                      ) : (
                        <><Send size={18} /> Enviar Candidatura</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
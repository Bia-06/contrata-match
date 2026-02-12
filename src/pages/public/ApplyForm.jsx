// src/pages/public/ApplyForm.jsx
import React, { useState, useRef } from 'react';
import { ChevronLeft, Upload, Loader2, MapPin, DollarSign, Calendar, CheckCircle2, Check, FileText, X, AlertTriangle } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { publicService } from '../../services/publicService';

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
    city: '',
    state: '',
    experience: '',
    salary: '',
    availability: '',
  });

  if (!selectedJob) return null;

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são aceitos.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 5 MB.');
      return;
    }
    setResumeFile(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Nome e email são obrigatórios.');
      return;
    }
    if (!consentLgpd) {
      setError('Você precisa aceitar o termo de consentimento LGPD.');
      return;
    }

    setLoading(true);
    try {
      await publicService.submitApplication({
        jobId: selectedJob.id,
        companyId: selectedJob.company_id,
        candidateName: form.name.trim(),
        candidateEmail: form.email.trim(),
        candidatePhone: form.phone.trim() || null,
        candidateCity: form.city.trim() || null,
        candidateState: form.state.trim() || null,
        experience: form.experience.trim() || null,
        salaryExpectation: form.salary || null,
        availability: form.availability.trim() || null,
        resumeFile: resumeFile,
        consentLgpd: true,
      });

      showToast('Candidatura enviada com sucesso! 🎉');
      onNavigate('jobs');
    } catch (err) {
      console.error('Erro ao enviar candidatura:', err);
      if (err.message?.includes('violates row-level security')) {
        setError('Esta vaga não está mais aceitando candidaturas.');
      } else {
        setError('Erro ao enviar candidatura. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navbar minimal onNavigate={onNavigate} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <button onClick={() => onNavigate('jobs')}
          className="flex items-center text-sm text-emerald-900/50 hover:text-emerald-900 mb-6 transition-colors font-medium">
          <ChevronLeft size={16} className="mr-1" /> Voltar para vagas
        </button>

        {/* Header da Vaga */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-5">
              <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center font-serif font-bold text-3xl text-emerald-700 shadow-sm shrink-0">
                {selectedJob.companyLogo ? (
                  <img src={selectedJob.companyLogo} alt={selectedJob.company} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  selectedJob.company?.charAt(0) || '?'
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{selectedJob.title}</h1>
                <p className="text-emerald-700 font-medium text-lg">{selectedJob.company}</p>
              </div>
            </div>
            <span className="px-4 py-1.5 bg-gray-100 text-gray-600 font-bold rounded-full uppercase text-sm">
              {selectedJob.type}
            </span>
          </div>

          <div className="flex flex-wrap gap-6 mt-6 text-gray-600 text-sm font-medium">
            <span className="flex items-center gap-2"><MapPin size={18} className="text-gray-400" /> {selectedJob.location}</span>
            <span className="flex items-center gap-2"><DollarSign size={18} className="text-gray-400" /> {selectedJob.salary}</span>
            <span className="flex items-center gap-2"><Calendar size={18} className="text-gray-400" /> {selectedJob.posted}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* COLUNA ESQUERDA - DETALHES DA VAGA */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sobre a vaga</h3>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {selectedJob.description || 'Sem descrição detalhada.'}
              </div>
            </section>

            {/* Info adicional da vaga */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detalhes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Contrato', value: selectedJob.type },
                  { label: 'Localidade', value: selectedJob.location },
                  { label: 'Salário', value: selectedJob.salary },
                  selectedJob.seniority && { label: 'Senioridade', value: { junior: 'Júnior', pleno: 'Pleno', senior: 'Sênior' }[selectedJob.seniority] || selectedJob.seniority },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} className="bg-stone-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* COLUNA DIREITA - FORMULÁRIO */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                Candidate-se a esta vaga
              </h3>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm mb-4 border border-red-100">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <Input label="Nome completo *" placeholder="Seu nome completo" required
                  value={form.name} onChange={set('name')} />

                <Input label="E-mail *" type="email" placeholder="seu@email.com" required
                  value={form.email} onChange={set('email')} />

                <Input label="Telefone" placeholder="(00) 00000-0000"
                  value={form.phone} onChange={set('phone')} />

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Cidade" placeholder="São Paulo"
                    value={form.city} onChange={set('city')} />
                  <Input label="Estado" placeholder="SP"
                    value={form.state} onChange={set('state')} />
                </div>

                <Input label="Pretensão Salarial" placeholder="R$ 3.000"
                  value={form.salary} onChange={set('salary')} />

                <Input label="Disponibilidade" placeholder="Ex: Imediata, 2 semanas..."
                  value={form.availability} onChange={set('availability')} />

                <TextArea label="Experiência relevante" placeholder="Descreva brevemente sua experiência na área..."
                  rows={4} value={form.experience} onChange={set('experience')} />

                {/* Upload de currículo */}
                <div>
                  <label className="block text-sm font-medium text-emerald-900/80 mb-2">Currículo (PDF, máx. 5MB)</label>
                  <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />

                  {resumeFile ? (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <FileText size={20} className="text-emerald-600 shrink-0" />
                      <span className="text-sm text-emerald-800 font-medium flex-1 truncate">{resumeFile.name}</span>
                      <button type="button" onClick={() => setResumeFile(null)}
                        className="p-1 hover:bg-emerald-100 rounded-lg transition-colors">
                        <X size={16} className="text-emerald-600" />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-emerald-300 transition-all cursor-pointer group">
                      <Upload className="mx-auto text-gray-400 group-hover:text-emerald-500 mb-2 transition-colors" size={24} />
                      <p className="text-sm font-medium text-gray-600 group-hover:text-emerald-700">Clique para enviar seu currículo</p>
                    </div>
                  )}
                </div>

                {/* LGPD */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group" onClick={() => setConsentLgpd(!consentLgpd)}>
                    <div className={`w-5 h-5 mt-0.5 rounded-md border-2 transition-all flex items-center justify-center shrink-0 ${consentLgpd ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                      {consentLgpd && <Check size={14} className="text-white stroke-[3]" />}
                    </div>
                    <span className="text-xs text-gray-500 leading-tight">
                      Autorizo o tratamento dos meus dados pessoais para fins de recrutamento e seleção, conforme a <a href="#" className="text-emerald-700 font-medium hover:underline">Lei Geral de Proteção de Dados (LGPD)</a>.
                    </span>
                  </label>
                </div>

                <Button type="submit" size="lg"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-orange-200 shadow-lg"
                  disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} /> Enviando...
                    </span>
                  ) : 'Enviar Candidatura'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
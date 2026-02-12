import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { TextArea } from '../../components/ui/TextArea';
import { Button } from '../../components/ui/Button';
import { dataService } from './services/dataService';

export const AdminCreateJob = ({ setAdminView, user, showToast, jobToEdit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    location_mode: 'onsite', // Sempre Presencial
    city: 'Marília',         // Default
    state: 'São Paulo',      // Default e Fixo
    age_range: '',           // Antigo seniority
    contract_type: 'clt',
    salary_range: '',
    work_schedule: 'integral', // NOVO: Período
  });

  // Carregar dados se for edição
  useEffect(() => {
    if (jobToEdit) {
      setIsEditing(true);
      setForm({
        title: jobToEdit.title || '',
        description: jobToEdit.description || '',
        location_mode: 'onsite',
        city: ['Marília', 'Garça'].includes(jobToEdit.city) ? jobToEdit.city : 'Marília',
        state: 'São Paulo',
        age_range: jobToEdit.age_range || jobToEdit.seniority || '',
        contract_type: jobToEdit.contract_type || 'clt',
        salary_range: formatCurrencyInput(jobToEdit.salary_range || ''),
        work_schedule: jobToEdit.work_schedule || 'integral', // Carrega o período
      });
    }
  }, [jobToEdit]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  // Força primeira letra maiúscula no Título
  const handleTitleChange = (e) => {
    let val = e.target.value;
    if (val.length > 0) {
      val = val.charAt(0).toUpperCase() + val.slice(1);
    }
    setForm(prev => ({ ...prev, title: val }));
  };

  // Máscara de Moeda (R$ 1.000,00)
  const formatCurrencyInput = (value) => {
    if (!value) return '';
    let v = value.replace(/\D/g, '');
    v = (v / 100).toFixed(2) + '';
    v = v.replace('.', ',');
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return 'R$ ' + v;
  };

  const handleSalaryChange = (e) => {
    const formatted = formatCurrencyInput(e.target.value);
    setForm(prev => ({ ...prev, salary_range: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location_mode: 'onsite', 
        city: form.city,
        state: 'São Paulo', 
        age_range: form.age_range || null,
        contract_type: form.contract_type,
        salary_range: form.salary_range.trim() || null,
        work_schedule: form.work_schedule, // Envia o período
      };

      if (isEditing) {
        await dataService.updateJob(jobToEdit.id, payload);
        showToast('Vaga atualizada com sucesso!');
      } else {
        await dataService.createJob(user.companyId, { ...payload, status: 'active' });
        showToast('Vaga publicada com sucesso!');
      }
      
      setAdminView('jobs');
    } catch (err) {
      console.error('Erro ao salvar vaga:', err);
      showToast('Erro ao salvar vaga. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-[fadeInUp_0.5s_ease-out_forwards] max-w-3xl">
      <button onClick={() => setAdminView('jobs')}
        className="flex items-center text-sm text-emerald-900/50 hover:text-emerald-900 mb-6 transition-colors">
        <ChevronLeft size={16} className="mr-1" /> Voltar para lista
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-emerald-950 mb-2">
          {isEditing ? 'Editar Vaga' : 'Publicar Nova Vaga'}
        </h1>
        <p className="text-emerald-900/60">
          {isEditing ? 'Atualize as informações da vaga.' : 'Preencha os dados para encontrar o match ideal.'}
        </p>
      </div>

      <form className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm space-y-6" onSubmit={handleSubmit}>

        {/* Título */}
        <Input label="Título da Vaga" placeholder="Ex: Garçom" required
          value={form.title} onChange={handleTitleChange} />

        {/* Salário e Contrato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Salário Mensal" 
            placeholder="R$ 0,00"
            value={form.salary_range} 
            onChange={handleSalaryChange} 
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-900/80">Tipo de Contrato</label>
            <select value={form.contract_type} onChange={set('contract_type')}
              className="w-full px-5 py-3 bg-white/80 border border-emerald-100 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="clt">Regime CLT</option>
              <option value="pj">PJ / Freelancer</option>
              <option value="estagio">Estágio</option>
              <option value="extra">Extra (Diária)</option>
            </select>
          </div>
        </div>

        {/* Faixa Etária e Período */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-900/80">Faixa Etária Preferencial</label>
            <select value={form.age_range} onChange={set('age_range')}
              className="w-full px-5 py-3 bg-white/80 border border-emerald-100 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="">Indiferente</option>
              <option value="18-25">18 a 25 anos</option>
              <option value="26-35">26 a 35 anos</option>
              <option value="36-45">36 a 45 anos</option>
              <option value="46+">Acima de 46 anos</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-900/80">Período / Turno</label>
            <select value={form.work_schedule} onChange={set('work_schedule')}
              className="w-full px-5 py-3 bg-white/80 border border-emerald-100 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="integral">Integral (Comercial)</option>
              <option value="noturno">Noturno</option>
              <option value="diurno">Diurno / Manhã</option>
              <option value="tarde">Tarde / Noite</option>
              <option value="escala_6x1">Escala 6x1</option>
              <option value="escala_12x36">Escala 12x36</option>
              <option value="flexivel">Horário Flexível</option>
            </select>
          </div>
        </div>

        {/* Cidade e Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.2s_ease-out]">
          
          {/* Cidade: Select Fixo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-emerald-900/80">Cidade</label>
            <select value={form.city} onChange={set('city')}
              className="w-full px-5 py-3 bg-white/80 border border-emerald-100 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-orange-500/50">
              <option value="Marília">Marília</option>
              <option value="Garça">Garça</option>
            </select>
          </div>

          {/* Estado: Readonly */}
          <div className="space-y-2 opacity-60 pointer-events-none">
             <label className="block text-sm font-medium text-emerald-900/80">Estado</label>
             <div className="w-full px-5 py-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 font-medium">
               São Paulo
             </div>
          </div>
        </div>

        {/* Descrição */}
        <TextArea label="Descrição da Vaga" placeholder="Descreva as responsabilidades, requisitos e benefícios..." required
          rows={6} value={form.description} onChange={set('description')} />

        {/* Botões */}
        <div className="pt-6 border-t border-emerald-50 flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => setAdminView('jobs')}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar Vaga' : 'Publicar Vaga')}
          </Button>
        </div>
      </form>
    </div>
  );
};
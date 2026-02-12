// src/services/publicService.js
import { supabase } from '../lib/supabaseClient';

export const publicService = {

  // ── VAGAS ATIVAS (público, sem auth) ──
  async getActiveJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        companies ( id, name, logo_path, location, segment )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.companies?.name || 'Empresa',
      company_id: job.company_id,
      companyLogo: job.companies?.logo_path || null,
      companyLocation: job.companies?.location || null,
      companySegment: job.companies?.segment || null,
      location: formatLocation(job),
      location_mode: job.location_mode,
      city: job.city,
      state: job.state,
      salary: job.salary_range || 'A combinar',
      type: formatContractType(job.contract_type),
      contract_type: job.contract_type,
      seniority: job.seniority,
      // NOVO CAMPO: Período de Trabalho
      work_schedule: job.work_schedule, 
      posted: formatDate(job.created_at),
      created_at: job.created_at,
    }));
  },

  // ── EMPRESAS PARCEIRAS (público) ──
  async getCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, logo_path, location, segment, description, website')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // ── ENVIAR CANDIDATURA (anônimo) ──
  async submitApplication({ jobId, companyId, candidateName, candidateEmail, candidatePhone, candidateCity, candidateState, experience, salaryExpectation, availability, resumeFile, consentLgpd }) {
    let resumePath = 'not_provided';

    // 1. Upload do currículo (se tiver)
    if (resumeFile) {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${companyId}/${jobId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile, { contentType: resumeFile.type });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        resumePath = 'upload_failed';
      } else {
        resumePath = fileName;
      }
    }

    // 2. Inserir candidatura
    const { error } = await supabase
      .from('applications')
      .insert([{
        job_id: jobId,
        company_id: companyId,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        candidate_phone: candidatePhone || null,
        candidate_city: candidateCity || null,
        candidate_state: candidateState || null,
        availability: availability || null,
        salary_expectation: salaryExpectation ? parseFloat(String(salaryExpectation).replace(/\D/g, '')) : null,
        notes: experience || null,
        resume_path: resumePath,
        consent_lgpd: consentLgpd || false,
        status: 'new',
      }]);

    if (error) throw error;

    return { success: true };
  },
};

// ── Helpers ──
function formatLocation(job) {
  if (job.location_mode === 'remote') return 'Remoto';
  const parts = [];
  if (job.city) parts.push(job.city);
  if (job.state) parts.push(job.state);
  if (parts.length) return parts.join(', ');
  if (job.location_mode === 'hybrid') return 'Híbrido';
  return 'Presencial';
}

function formatContractType(type) {
  const labels = { clt: 'CLT', pj: 'PJ', estagio: 'Estágio', extra: 'Extra' };
  return labels[type] || type || 'CLT';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem. atrás`;
  return date.toLocaleDateString('pt-BR');
}
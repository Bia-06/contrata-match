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
      work_schedule: job.work_schedule || null,
      age_range: job.age_range || null,
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
  async submitApplication({
    jobId, companyId, candidateName, candidateEmail, candidatePhone,
    candidateAge, candidateCity, candidateNeighborhood,
    experience, salaryExpectation, availability, resumeFile, consentLgpd
  }) {
    let resumePath = 'not_provided';

    // Upload do currículo primeiro (se tiver)
    if (resumeFile) {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${companyId}/${jobId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile, { contentType: resumeFile.type });

      if (uploadError) {
        console.error('Erro no upload do currículo:', uploadError);
        resumePath = 'upload_failed';
      } else {
        resumePath = fileName;
      }
    }

    // Monta payload base (colunas que existem com certeza)
    const payload = {
      job_id: jobId,
      company_id: companyId,
      candidate_name: candidateName,
      candidate_email: candidateEmail || null,
      candidate_phone: candidatePhone || null,
      candidate_city: candidateCity || null,
      availability: availability || null,
      notes: experience || null,
      resume_path: resumePath,
      consent_lgpd: consentLgpd || false,
      status: 'new',
    };

    // salary_expectation: converte "R$ 2.500,00" para número
    if (salaryExpectation) {
      const digits = String(salaryExpectation).replace(/\D/g, '');
      if (digits && !isNaN(Number(digits))) {
        payload.salary_expectation = Number(digits) / 100;
      }
    }

    // Campos novos (podem não existir na tabela)
    if (candidateAge) payload.candidate_age = parseInt(candidateAge);
    if (candidateNeighborhood) payload.candidate_neighborhood = candidateNeighborhood;

    console.log('📋 Payload da candidatura:', JSON.stringify(payload, null, 2));

    // Primeira tentativa com todos os campos
    const { error } = await supabase.from('applications').insert([payload]);

    if (error) {
      console.error('❌ Erro Supabase:', error.message, '| code:', error.code, '| details:', error.details, '| hint:', error.hint);

      // Se o erro for de coluna inexistente, tenta sem os campos novos
      if (error.code === '42703' || error.message?.includes('column') || error.details?.includes('column')) {
        console.warn('⚠️ Retentando sem campos novos...');
        delete payload.candidate_age;
        delete payload.candidate_neighborhood;

        const { error: err2 } = await supabase.from('applications').insert([payload]);
        if (err2) {
          console.error('❌ Erro na 2ª tentativa:', err2.message, err2.code, err2.details);
          throw err2;
        }
        return { success: true };
      }

      throw error;
    }

    return { success: true };
  },

  // ── URL ASSINADA PARA DOWNLOAD DE CURRÍCULO ──
  async getResumeUrl(resumePath) {
    if (!resumePath || resumePath === 'not_provided' || resumePath === 'upload_failed') return null;
    const { data, error } = await supabase.storage.from('resumes').createSignedUrl(resumePath, 3600);
    if (error) { console.error('Erro URL currículo:', error); return null; }
    return data.signedUrl;
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
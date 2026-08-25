// src/services/publicService.js
// Aponta para o banco do AmorimHub: as vagas são `job` (vinculadas a `unit`)
// e as candidaturas são `job_application`. A antiga tabela `companies` foi
// substituída pela unidade do AmorimHub.
import { supabase } from '../lib/supabaseClient';

export const publicService = {

  // ── VAGAS ATIVAS (público, sem auth) ──
  async getActiveJobs() {
    const { data, error } = await supabase
      .from('job')
      .select(`
        *,
        unit ( id, name, logo_path, city, state, segment )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.unit?.name || 'Estabelecimento',
      unit_id: job.unit_id,
      companyLogo: logoUrl(job.unit?.logo_path),
      companyLocation: [job.unit?.city, job.unit?.state].filter(Boolean).join(', ') || null,
      companySegment: job.unit?.segment || null,
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
      custom_questions: job.custom_questions || [],
      posted: formatDate(job.created_at),
      created_at: job.created_at,
    }));
  },

  // ── ESTABELECIMENTOS PARCEIROS (público) ──
async getCompanies() {
    const { data, error } = await supabase
      .from('unit')
      .select('id, name, logo_path, city, state, segment, description, website, phone, email')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map(u => ({
      id: u.id,
      name: u.name,
      logo_path: logoUrl(u.logo_path),
      location: [u.city, u.state].filter(Boolean).join(', ') || null,
      segment: u.segment || null,
      description: u.description || null,
      website: u.website || null,
      phone: u.phone || null,
      email: u.email || null,
    }));
  },

  // ── ENVIAR CANDIDATURA (anônimo) ──
  async submitApplication({
    jobId, unitId, candidateName, candidateEmail, candidatePhone,
    candidateAge, candidateCity, candidateNeighborhood,
    experience, salaryExpectation, availability, resumeFile, consentLgpd
  }) {
    let resumePath = null;

    // O currículo sobe ANTES: o caminho dele vai gravado na candidatura.
    // O caminho precisa ser {unit_id}/{job_id}/... — a regra do Storage exige.
    if (resumeFile) {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${unitId}/${jobId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('curriculos')
        .upload(fileName, resumeFile, { contentType: resumeFile.type });

      if (uploadError) {
        console.error('Erro no upload do currículo:', uploadError);
        // Segue sem currículo em vez de perder a candidatura inteira
      } else {
        resumePath = fileName;
      }
    }

    const payload = {
      job_id: jobId,
      unit_id: unitId,
      candidate_name: candidateName,
      candidate_email: candidateEmail || null,
      candidate_phone: candidatePhone || null,
      candidate_age: candidateAge ? parseInt(candidateAge) : null,
      candidate_city: candidateCity || null,
      candidate_neighborhood: candidateNeighborhood || null,
      availability: availability || null,
      // A experiência é resposta do candidato — vai em `answers`.
      // `notes` fica reservado para as anotações internas da unidade.
      answers: experience ? { experiencia: experience } : null,
      resume_path: resumePath,
      consent_lgpd: true,   // o formulário só envia com o aceite marcado
      status: 'new',
    };

    // "R$ 2.500,00" → 2500.00
    if (salaryExpectation) {
      const digits = String(salaryExpectation).replace(/\D/g, '');
      if (digits && !isNaN(Number(digits))) {
        payload.salary_expectation = Number(digits) / 100;
      }
    }

    const { error } = await supabase.from('job_application').insert([payload]);

    if (error) {
      console.error('Erro ao enviar candidatura:', error.message, error.code, error.details);
      throw error;
    }

    return { success: true };
  },
};

// ── Helpers ──

// Monta a URL pública da logo a partir do caminho salvo
function logoUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from('logos').getPublicUrl(path);
  return data?.publicUrl || null;
}

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
  // No AmorimHub o contrato é texto livre ("CLT", "Freelancer"...),
  // então mostramos como veio.
  return type || 'A combinar';
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
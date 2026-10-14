// src/lib/routes.js
// Rotas públicas do app. A navegação continua sendo por estado (App.jsx),
// mas cada página tem uma URL própria para poder ser compartilhada:
//
//   /                          → início
//   /vagas                     → todas as vagas
//   /vagas/:estabelecimento    → vagas de um estabelecimento (slug do nome ou id)
//   /vaga/:id                  → formulário de candidatura de uma vaga
//   /restaurantes              → parceiros
//   /sobre                     → sobre

// "Bar do Amorim - Marília" → "bar-do-amorim-marilia"
export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Monta o caminho de um destino. `params` carrega o que a rota precisa.
export function buildPath(page, params = {}) {
  switch (page) {
    case 'jobs':
      return params.company ? `/vagas/${params.company}` : '/vagas';
    case 'apply':
      return params.jobId ? `/vaga/${params.jobId}` : '/vagas';
    case 'restaurants':
      return '/restaurantes';
    case 'about':
      return '/sobre';
    default:
      return '/';
  }
}

// Lê a URL atual e devolve { page, params }
export function parsePath(pathname) {
  const parts = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const [first, second] = parts;

  switch (first) {
    case 'vagas':
      return { page: 'jobs', params: { company: second || null } };
    case 'vaga':
      return second ? { page: 'apply', params: { jobId: second } } : { page: 'jobs', params: {} };
    case 'restaurantes':
      return { page: 'restaurants', params: {} };
    case 'sobre':
      return { page: 'about', params: {} };
    default:
      return { page: 'landing', params: {} };
  }
}

// O estabelecimento da URL bate com esta vaga? Aceita slug do nome ou id.
export function matchesCompany(job, company) {
  if (!company) return true;
  return String(job.unit_id) === String(company) || slugify(job.company) === company;
}

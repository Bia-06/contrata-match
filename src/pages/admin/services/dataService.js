// src/pages/admin/services/dataService.js
import { supabase } from '../../../lib/supabaseClient';

export const dataService = {

  //  VAGAS (JOBS)

  async getCompanyJobs(companyId) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createJob(companyId, jobData) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([{ company_id: companyId, ...jobData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateJob(jobId, updates) {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteJob(jobId) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  },

  //  CANDIDATURAS 

  async getCompanyApplications(companyId) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs ( title, status )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(app => ({
      ...app,
      job_title: app.jobs?.title || 'Vaga removida',
      job_status: app.jobs?.status || 'closed',
    }));
  },

  async updateApplicationStatus(applicationId, newStatus) {
    const { data, error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateApplicationNotes(applicationId, notes) {
    const { data, error } = await supabase
      .from('applications')
      .update({ notes })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  //  DASHBOARD 

  async getDashboardStats(companyId) {
    // Vagas ativas
    const { count: activeJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active');

    // Total de vagas
    const { count: totalJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    // Total de candidaturas
    const { count: totalApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    // Candidaturas este mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', startOfMonth.toISOString());

    // Candidaturas esta semana
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { count: weekApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', startOfWeek.toISOString());

    // Novos (pendentes)
    const { count: pendingApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'new');

    // Aprovados
    const { count: approvedApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'approved');

    return {
      activeJobs: activeJobs || 0,
      totalJobs: totalJobs || 0,
      totalApplications: totalApplications || 0,
      monthApplications: monthApplications || 0,
      weekApplications: weekApplications || 0,
      pendingApplications: pendingApplications || 0,
      approvedApplications: approvedApplications || 0,
    };
  },

  async getRecentApplications(companyId, limit = 5) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id, candidate_name, candidate_email, status, created_at,
        jobs ( title )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(app => ({
      ...app,
      job_title: app.jobs?.title || 'Vaga removida',
    }));
  },

  //  PERFIL DA EMPRESA

  async getCompanyProfile(companyId) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateCompanyProfile(companyId, updates) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
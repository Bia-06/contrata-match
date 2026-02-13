// src/pages/admin/services/authService.js
import { supabase } from '../../../lib/supabaseClient';

export const authService = {

  // ── CADASTRO ──
  async register({ email, password, companyName, cnpj, ownerName }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: ownerName,
          company_name: companyName,
          cnpj: cnpj,
        },
      },
    });

    if (authError) throw authError;

    // Se tem sessão (confirm email OFF) → empresa já foi criada pelo trigger
    if (authData.user && authData.session) {
      const company = await this.getCurrentCompany();
      return { user: authData.user, company, needsEmailConfirmation: false };
    }

    // Sem sessão (confirm email ON) → precisa confirmar email primeiro
    return { user: authData.user, company: null, needsEmailConfirmation: true };
  },

  // ── LOGIN ──
  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        throw new Error('Email ou senha incorretos.');
      }
      if (error.message === 'Email not confirmed') {
        throw new Error('Confirme seu email antes de entrar.');
      }
      throw error;
    }

    return data;
  },

  // ── LOGOUT ──
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // ── ESQUECEU A SENHA ──
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?view=resetPassword`,
    });
    if (error) throw error;
    return data;
  },

  // ── ATUALIZAR SENHA ──
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  // ── USUÁRIO ATUAL ──
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  },

  // ── SESSÃO ATUAL ──
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // ── EMPRESA DO USUÁRIO LOGADO ──
  async getCurrentCompany() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar empresa:', error);
      return null;
    }
    return data;
  },

  // ── LISTENER DE AUTH ──
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
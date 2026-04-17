import { supabase } from '../config/supabase';

// ==============================================
// EXPENSES
// ==============================================

export const insertExpense = async (userId, expense) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([{ user_id: userId, ...expense }])
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

export const getExpensesByUser = async (userId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateExpense = async (id, updates) => {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

export const deleteExpense = async (id) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ==============================================
// PROFILES
// ==============================================

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
};

export const upsertProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...profileData }, { onConflict: 'id' })
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

export const updateProfileContext = async (userId, summaryText) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      ai_context_summary: summaryText, 
      ai_context_updated_at: new Date().toISOString() 
    })
    .eq('id', userId)
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

export const invalidateProfileContext = async (userId) => {
  const { error } = await supabase
    .from('profiles')
    .update({ 
      ai_context_summary: null 
    })
    .eq('id', userId);

  if (error) throw error;
};

// ==============================================
// RECURRING CHARGES
// ==============================================

export const getRecurringCharges = async (userId) => {
  const { data, error } = await supabase
    .from('recurring_charges')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('billing_day', { ascending: true });

  if (error) throw error;
  return data;
};

export const insertRecurringCharge = async (userId, charge) => {
  const { data, error } = await supabase
    .from('recurring_charges')
    .insert([{ user_id: userId, ...charge }])
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

export const updateRecurringCharge = async (id, updates) => {
  const { data, error } = await supabase
    .from('recurring_charges')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

export const deleteRecurringCharge = async (id) => {
  // Soft delete: mark as inactive
  const { error } = await supabase
    .from('recurring_charges')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
};

// ==============================================
// STRATEGIES
// ==============================================

export const getLatestStrategy = async (userId) => {
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const getStrategyHistory = async (userId) => {
  const { data, error } = await supabase
    .from('strategies')
    .select('id, created_at, input_snapshot, emergency_target_mxn')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
};

export const insertStrategy = async (userId, strategy) => {
  const { data, error } = await supabase
    .from('strategies')
    .insert([{ user_id: userId, ...strategy }])
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

// ==============================================
// CHAT MESSAGES
// ==============================================

export const getChatHistory = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const insertChatMessage = async (userId, message) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([{ user_id: userId, ...message }])
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

export const clearChatHistory = async (userId) => {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};

// ==============================================
// SIMULATIONS
// ==============================================

export const getSimulations = async (userId) => {
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
};

export const insertSimulation = async (userId, simulation) => {
  const { data, error } = await supabase
    .from('simulations')
    .insert([{ user_id: userId, ...simulation }])
    .select();

  if (error) throw error;
  return data ? data[0] : null;
};

import { supabase } from '../config/supabase';

export const insertExpense = async (userId, concept, amount, category) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([
      { user_id: userId, concept, amount, category }
    ])
    .select();

  if (error) {
    throw error;
  }
  return data ? data[0] : null;
};

export const getExpensesByUser = async (userId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data;
};

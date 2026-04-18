import { supabase } from '../config/supabase';

// ==============================================
// YIELD RATES SERVICE
// Reads from the yield_rates table (public data).
// Write operations are handled by the Edge Function.
// ==============================================

/**
 * Fetches all yield rates with institutional health columns.
 * Sorted by max_apy descending so the best rates appear first.
 */
export const getYieldRates = async () => {
  const { data, error } = await supabase
    .from('yield_rates')
    .select(
      'id, institution_name, instrument_type, annual_rate, gat_nominal, term_days, ' +
      'trust_score, protection_type, base_apy, max_apy, ' +
      'requirements_description, is_promotional, source_url, last_fetched_at'
    )
    .order('max_apy', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

/**
 * Fetches yield rates filtered by instrument type.
 * @param {'cetes' | 'sofipo' | 'bank' | 'fintech' | 'bond'} type
 */
export const getYieldRatesByType = async (type) => {
  const { data, error } = await supabase
    .from('yield_rates')
    .select('*')
    .eq('instrument_type', type)
    .order('max_apy', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

/**
 * Returns the single best rate across all institutions.
 */
export const getBestRate = async () => {
  const { data, error } = await supabase
    .from('yield_rates')
    .select('*')
    .order('max_apy', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

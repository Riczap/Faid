import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getExpensesByUser } from '../services/db.service';
import { useAuth } from './AuthContext';

const FinancialContext = createContext();

export const useFinancial = () => {
  return useContext(FinancialContext);
};

/**
 * Currency display configuration.
 * symbol: the currency symbol prefix
 * locale: Intl locale string for number formatting
 * rate: conversion rate from MXN (base currency) — used for display only
 */
const CURRENCY_CONFIG = {
  MXN: { symbol: '$',  locale: 'es-MX', rate: 1 },
  USD: { symbol: 'US$', locale: 'en-US', rate: 0.058 },
  EUR: { symbol: '€',  locale: 'de-DE', rate: 0.054 },
};

export const FinancialProvider = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [financialProfile, setFinancialProfile] = useState(null);
  const [aiAnalyses, setAiAnalyses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState('MXN');

  const fetchUserExpenses = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getExpensesByUser(user.id);
      setExpenses(data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Format a numeric amount as a currency string using the currently selected currency.
   * @param {number} amount - The amount in MXN (base currency).
   * @param {object} [options] - Optional overrides.
   * @param {number} [options.decimals=0] - Number of decimal places.
   * @param {boolean} [options.showCode=false] - Append currency code (e.g. "MXN").
   * @returns {string} Formatted currency string, e.g. "$12,500" or "US$725.00 USD"
   */
  const formatCurrency = useCallback((amount, options = {}) => {
    const { decimals = 0, showCode = false } = options;
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.MXN;
    const converted = amount * config.rate;
    const formatted = converted.toLocaleString(config.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${config.symbol}${formatted}${showCode ? ` ${currency}` : ''}`;
  }, [currency]);

  const value = useMemo(() => ({
    expenses,
    setExpenses,
    financialProfile,
    setFinancialProfile,
    aiAnalyses,
    setAiAnalyses,
    fetchUserExpenses,
    loading,
    error,
    currency,
    setCurrency,
    formatCurrency,
  }), [expenses, financialProfile, aiAnalyses, fetchUserExpenses, loading, error, currency, formatCurrency]);

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

import React, { createContext, useContext, useState, useCallback } from 'react';
import { getExpensesByUser } from '../services/db.service';
import { useAuth } from './AuthContext';

const FinancialContext = createContext();

export const useFinancial = () => {
  return useContext(FinancialContext);
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

  const value = {
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
    setCurrency
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

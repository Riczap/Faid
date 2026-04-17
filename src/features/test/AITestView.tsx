import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinancial } from '../../context/FinancialContext';
import { insertExpense } from '../../services/db.service';
import { categorizeExpense, generateFinancialStrategy } from '../../services/ai.service';
import Input from '../../template/components/form/input/InputField';
import Label from '../../template/components/form/Label';
import Button from '../../template/components/ui/button/Button';

export default function AITestView() {
  const { user } = useAuth();

  // Categorizer state
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const { expenses, fetchFinancialData, currency } = useFinancial();
  const [catLoading, setCatLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  
  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  // Strategy state
  const [strategyResult, setStrategyResult] = useState(null);
  const [stratLoading, setStratLoading] = useState(false);
  
  // Handlers
  const handleCategorize = async () => {
    if (!concept) return;
    setCatLoading(true);
    try {
      const predictedCategory = await categorizeExpense(concept);
      setCategory(predictedCategory);
    } catch (err) {
      console.error(err);
    } finally {
      setCatLoading(false);
    }
  };

  const handleSaveToDB = async () => {
    if (!user || !concept || !amount || !category) return;
    setDbLoading(true);
    try {
      await insertExpense(user.id, { concept, amount: parseFloat(amount), category, source: 'manual' });
      await fetchFinancialData(); // Refresh global context
      setConcept("");
      setAmount("");
      setCategory("");
      alert("Successfully inserted expense to Supabase!");
    } catch (err) {
      console.error(err);
      alert("Database error. Did you push migrations?");
    } finally {
      setDbLoading(false);
    }
  };

  const handleGenerateStrategy = async () => {
    setStratLoading(true);
    // Bundle context stuff into userData payload
    const userData = {
      profile: user?.user_metadata || {},
      totalExpenses: expenses.length,
      expensesSummary: expenses.map(e => ({ concept: e.concept, amount: e.amount, category: e.category }))
    };
    
    try {
      const result = await generateFinancialStrategy(userData);
      setStrategyResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setStratLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">Test: AI Categorizer & DB Insert</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Expense Concept</Label>
            <Input type="text" value={concept} onChange={(e: any) => setConcept(e.target.value)} placeholder="e.g. Starbucks Latte" />
          </div>
          <div>
            <Label>Amount ({currency})</Label>
            <Input type="number" value={amount} onChange={(e: any) => setAmount(e.target.value)} placeholder="80" />
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-5">
           <Button size="sm" onClick={handleCategorize} disabled={catLoading || !concept}>
              {catLoading ? "Predicting..." : "Predict Category"}
           </Button>
           {category && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1.5 text-sm font-medium text-brand-500">
                Predicted: <strong className="font-bold">{category}</strong>
              </span>
           )}
        </div>

        <div className="pt-4 mt-5 border-t border-gray-200 dark:border-gray-800">
           <Button size="sm" variant="outline" onClick={handleSaveToDB} disabled={dbLoading || !category || !amount}>
              {dbLoading ? "Saving..." : "Save Expense to Database"}
           </Button>
        </div>
      </div>

      <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">Test: Extract JSON Financial Strategy</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          This sends your {expenses.length} actual saved expenses to Gemini, and commands it to strictly format structured Mexican market asset allocations and debt priorities.
        </p>
        <Button size="sm" onClick={handleGenerateStrategy} disabled={stratLoading}>
          {stratLoading ? "Generating..." : "Generate JSON AI Strategy"}
        </Button>

        {strategyResult && (
          <div className="mt-5 p-4 overflow-x-auto bg-gray-50 rounded-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <pre className="text-sm text-gray-800 dark:text-gray-300">
              {JSON.stringify(strategyResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

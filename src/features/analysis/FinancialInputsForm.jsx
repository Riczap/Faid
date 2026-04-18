import React, { useEffect, useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import Input from '../../template/components/form/input/InputField';
import Button from '../../template/components/ui/button/Button';
import Label from '../../template/components/form/Label';
import ComponentCard from '../../template/components/common/ComponentCard';

const FinancialInputsForm = ({ onSubmit, isLoading }) => {
  const { currency, financialProfile } = useFinancial();
  
  const [formData, setFormData] = useState({
    income: 0,
    expenses: 0,
    debts: 0,
    contribution: 0,
    desired_timeframe: ''
  });

  useEffect(() => {
    if (financialProfile) {
      setFormData(prev => ({
        ...prev,
        income: financialProfile.income || 0,
        expenses: financialProfile.fixed_expenses || 0,
        debts: financialProfile.total_debts || 0,
        contribution: financialProfile.monthly_contribution || 0
      }));
    }
  }, [financialProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    onSubmit(formData);
  };

  return (
    <ComponentCard title="Contexto Financiero" desc="Estos datos son de solo lectura y se sincronizan desde tu Perfil Maestro en la base de datos.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label>Ingresos Totales ({currency})</Label>
          <Input 
            type="number" 
            name="income" 
            value={formData.income} 
            disabled={true}
          />
        </div>
        <div>
          <Label>Gastos Fijos Totales ({currency})</Label>
          <Input 
            type="number" 
            name="expenses" 
            value={formData.expenses} 
            disabled={true}
          />
        </div>
        <div>
          <Label>Deudas Totales ({currency})</Label>
          <Input 
            type="number" 
            name="debts" 
            value={formData.debts} 
            disabled={true}
          />
        </div>
        <div>
          <Label>Aportación Mensual al Plan ({currency})</Label>
          <Input 
            type="number" 
            name="contribution" 
            value={formData.contribution} 
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div>
          <Label>Plazo Deseado (Meses)</Label>
          <Input 
            type="number" 
            name="desired_timeframe" 
            placeholder="Ej. 12"
            value={formData.desired_timeframe} 
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="pt-2">
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? 'Generando Plan...' : 'Generar Plan Financiero'}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
};

export default FinancialInputsForm;

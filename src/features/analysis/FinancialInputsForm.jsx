import React, { useState } from 'react';
import Input from '../../template/components/form/input/InputField';
import Button from '../../template/components/ui/button/Button';
import Label from '../../template/components/form/Label';
import ComponentCard from '../../template/components/common/ComponentCard';

const FinancialInputsForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    income: '',
    expenses: '',
    debts: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <ComponentCard title="Contexto Financiero" desc="Ingresa tus datos para generar un plan a medida.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label>Ingresos Totales (MXN)</Label>
          <Input 
            type="number" 
            name="income" 
            placeholder="0.00" 
            value={formData.income} 
            onChange={handleChange} 
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <Label>Gastos Fijos Totales (MXN)</Label>
          <Input 
            type="number" 
            name="expenses" 
            placeholder="0.00" 
            value={formData.expenses} 
            onChange={handleChange} 
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <Label>Deudas Totales (MXN)</Label>
          <Input 
            type="number" 
            name="debts" 
            placeholder="0.00" 
            value={formData.debts} 
            onChange={handleChange} 
            required
            disabled={isLoading}
          />
        </div>
        <div className="pt-2">
          {/* Workaround for Button if it doesn't support type="submit", we wrap it or handle onClick, but Button usually accepts it if it's passed down. We will use a div with onClick just in case, but standard template buttons might support it. Actually, the template button had onClick, didn't pass type, let's look at Button.tsx: it renders <button onClick={...}>. It doesn't pass type="submit". So we need to handle onClick instead of onSubmit on the form, or pass type to button. Since we can't change Button.tsx easily (read-only zone), we will handle onClick on the Button and call handleSubmit. */}
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? 'Generando Plan...' : 'Generar Plan Financiero'}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
};

export default FinancialInputsForm;

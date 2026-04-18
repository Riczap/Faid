import React, { useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Dropdown } from '../../template/components/ui/dropdown/Dropdown';
import { DropdownItem } from '../../template/components/ui/dropdown/DropdownItem';

const CurrencySelector = () => {
  const { currency, setCurrency } = useFinancial();
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    { code: 'MXN', label: 'Pesos (MXN)' },
    { code: 'USD', label: 'US Dollar (USD)' },
    { code: 'EUR', label: 'Euro (EUR)' }
  ];

  const handleSelect = (code) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="dropdown-toggle flex items-center justify-center w-10 h-10 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
        title="Cambiar Moneda"
      >
        <span className="font-semibold text-sm">{currency}</span>
      </button>
      
      <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-48 mt-2">
        <div className="py-2">
          {currencies.map((curr) => (
            <DropdownItem
              key={curr.code}
              onItemClick={() => handleSelect(curr.code)}
              className={currency === curr.code ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-sm ${currency === curr.code ? 'font-medium' : ''}`}>{curr.label}</span>
                {currency === curr.code && (
                  <svg className="w-4 h-4 text-brand-600 dark:text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </DropdownItem>
          ))}
        </div>
      </Dropdown>
    </div>
  );
};

export default CurrencySelector;

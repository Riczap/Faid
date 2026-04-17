import React, { useRef } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { useReactToPrint } from 'react-to-print';
import ComponentCard from '../../template/components/common/ComponentCard';
import Button from '../../template/components/ui/button/Button';
import Badge from '../../template/components/ui/badge/Badge';

const StrategyStepper = ({ planData, onReset }) => {
  const { formatCurrency } = useFinancial();
  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Mi_Plan_Financiero_Faid'
  });

  return (
    <ComponentCard title="Tu Plan de Acción (3 Fases)" desc="Sigue este plan estratégico generado por nuestra IA para estabilizar y hacer crecer tus finanzas.">
      <div ref={contentRef} className="print:p-8 print:bg-white">
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Plan de Acción Financiero</h1>
          <p className="text-gray-500 mt-1">Generado por Asesor IA</p>
        </div>
        <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-8 mt-4">
        
        {/* Paso 1 */}
        <div className="relative pl-8">
          <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-brand-500 rounded-full ring-4 ring-white dark:ring-gray-900">
            <span className="text-white font-bold text-sm">1</span>
          </span>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resuelve Tu Deuda</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{planData.estimated_timeframes?.step1 || "1-6 Meses"}</span>
              <Badge color="error">Prioridad Alta</Badge>
            </div>
          </div>
          <p className="mb-3 text-base font-normal text-gray-500 dark:text-gray-400">
            Atacar las deudas con mayor tasa de interés es el paso más importante para liberar flujo de efectivo.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Focos de atención:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {planData.debt_priority && planData.debt_priority.length > 0 ? (
                planData.debt_priority.map((debt, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{debt}</li>
                ))
              ) : (
                <li className="text-sm text-gray-600 dark:text-gray-400">Mantener pagos al día y enfocar capital en evitar nuevos intereses.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Paso 2 */}
        <div className="relative pl-8">
          <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full ring-4 ring-white dark:ring-gray-900">
            <span className="text-gray-600 dark:text-gray-300 font-bold text-sm">2</span>
          </span>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Armar Tu Colchón</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{planData.estimated_timeframes?.step2 || "6-12 Meses"}</span>
              <Badge color="warning">Mediano Plazo</Badge>
            </div>
          </div>
          <p className="mb-3 text-base font-normal text-gray-500 dark:text-gray-400">
            Un fondo de emergencia te protege contra imprevistos sin necesidad de volver a endeudarte.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta recomendada:</span>
             <span className="text-lg font-bold text-brand-500">
               {formatCurrency(planData.emergency_target_mxn, { showCode: true })}
             </span>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="relative pl-8">
          <span className="absolute -left-4 flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full ring-4 ring-white dark:ring-gray-900">
            <span className="text-gray-600 dark:text-gray-300 font-bold text-sm">3</span>
          </span>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inversión y Crecimiento</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{planData.estimated_timeframes?.step3 || "Continuo"}</span>
              <Badge color="success">Largo Plazo</Badge>
            </div>
          </div>
          <p className="mb-3 text-base font-normal text-gray-500 dark:text-gray-400">
            Protege tu dinero contra la inflación y ponlo a trabajar para generar rendimientos.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
             <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estrategia principal: </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{planData.inflation_protection_strategy}</span>
             </div>
             
             <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Distribución recomendada (Portafolio):</span>
                <div className="flex w-full h-4 rounded-full overflow-hidden">
                  <div className="bg-brand-500 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${planData.allocation.cetes}%` }}>CETES {planData.allocation.cetes}%</div>
                  <div className="bg-success-500 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${planData.allocation.udibonos}%` }}>UDIBONOS {planData.allocation.udibonos}%</div>
                  <div className="bg-warning-500 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${planData.allocation.liquidity}%` }}>LIQUIDEZ {planData.allocation.liquidity}%</div>
                </div>
             </div>
          </div>
        </div>
      </div>
      </div>
      
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="outline" onClick={onReset}>Modificar Datos</Button>
        <Button onClick={() => handlePrint()} startIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        }>
          Guardar PDF
        </Button>
      </div>
    </ComponentCard>
  );
};

export default StrategyStepper;

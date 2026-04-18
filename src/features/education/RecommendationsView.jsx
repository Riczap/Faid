import React, { useEffect, useState } from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { getInvestmentRecommendations } from '../../services/ai.service';
import { Modal } from '../../template/components/ui/modal';
import { BoltIcon, PieChartIcon, DollarLineIcon } from '../../template/icons';

const RecommendationsView = () => {
  const { financialProfile, expenses } = useFinancial();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null); // specific recommendation

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const data = await getInvestmentRecommendations(financialProfile, expenses);
        setRecommendations(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    if (financialProfile) {
      fetchRecommendations();
    }
  }, [financialProfile, expenses]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recomendaciones Personalizadas</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Estrategias de inversión calculadas dinámicamente según tus ingresos netos y gastos fijos registrados.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 py-32 space-y-4 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
          <svg className="animate-spin h-8 w-8 text-brand-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span className="text-sm animate-pulse text-gray-500 dark:text-gray-400">Analizando perfil financiero...</span>
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedTopic(rec)}
                className="cursor-pointer bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 shadow-theme-md hover:shadow-theme-xl transition-all hover:-translate-y-2 duration-300 flex flex-col justify-between group min-h-[320px]"
              >
                <div>
                  {index === 0 && (
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors mx-auto">
                      <PieChartIcon className="w-6 h-6 text-indigo-500" />
                    </div>
                  )}
                  {index === 1 && (
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors mx-auto">
                      <BoltIcon className="w-6 h-6 text-emerald-500" />
                    </div>
                  )}
                  {index === 2 && (
                    <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors mx-auto">
                      <DollarLineIcon className="w-6 h-6 text-amber-500" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    {rec.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 text-center">
                    {rec.description.replace(/\*\*/g, '')}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 text-brand-500 font-medium text-sm flex items-center justify-center gap-2">
                  Leer detallado
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          No hay recomendaciones disponibles para tu perfil actual.
        </div>
      )}

      {/* Modal Interactivo (Plantilla) */}
      <Modal isOpen={!!selectedTopic} onClose={() => setSelectedTopic(null)} className="w-full max-w-5xl overflow-hidden p-0 rounded-[2rem]">
        {selectedTopic && (
          <div className="flex flex-col max-h-[85vh]">
            <div className="p-6 sm:p-10 overflow-y-auto w-full bg-white dark:bg-gray-900 rounded-[2rem]">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 leading-tight text-center">
                {selectedTopic.title}
              </h3>
            
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed text-gray-700 dark:text-gray-300 text-center mx-auto">
                {selectedTopic.description.replace(/\*\*/g, '').split('\n').map((line, i) => (
                    <p key={i} className="mb-4 text-center">
                      {line}
                    </p>
                ))}
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0">
               <button 
                 onClick={() => setSelectedTopic(null)}
                 className="px-8 py-3 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-xl transition-colors font-semibold text-sm"
               >
                 Entendido, cerrar
               </button>
            </div>
          </div>
        </div>
        )}
      </Modal>
    </div>
  );
};

export default RecommendationsView;

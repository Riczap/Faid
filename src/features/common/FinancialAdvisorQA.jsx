import React, { useState } from 'react';
import ComponentCard from '../../template/components/common/ComponentCard';
import Button from '../../template/components/ui/button/Button';
import TextArea from '../../template/components/form/input/TextArea';

const FinancialAdvisorQA = ({ contextData, className = "", onChatStart }) => {
  const [question, setQuestion] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);

  const handleAskQuestion = () => {
    if (!question.trim()) return;

    const newQuestion = { id: Date.now(), role: 'user', text: question };
    setQaHistory((prev) => [...prev, newQuestion]);
    setQuestion('');
    setIsAnswering(true);
    
    if (onChatStart && qaHistory.length === 0) {
      onChatStart();
    }

    // Simulación de retraso de red para la respuesta de IA (Mock Phase 1)
    setTimeout(() => {
      const mockResponse = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        text: 'Esa es una excelente pregunta. Analizando tu contexto financiero, te recomiendo seguir el plan propuesto para minimizar riesgos y maximizar el flujo de efectivo a largo plazo.'
      };
      setQaHistory((prev) => [...prev, mockResponse]);
      setIsAnswering(false);
    }, 2500);
  };

  return (
    <div className={className}>
      <ComponentCard title="Asesoría Financiera Inteligente" desc="¿Tienes dudas? Pregúntale a nuestra IA y resuelve cualquier inquietud basada en tu contexto.">
        <div className="space-y-4">
          {/* Chat History */}
          {qaHistory.length > 0 && (
            <div className="space-y-4 max-h-[400px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              {qaHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] xl:max-w-[70%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-brand-500 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAnswering && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                    <div className="flex space-x-1.5 items-center h-5">
                      <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="flex flex-col space-y-3 pt-2">
            <TextArea 
              placeholder="Ej. ¿Qué pasa si aporto $2,000 extra este mes?" 
              value={question} 
              onChange={(val) => setQuestion(val)} 
              disabled={isAnswering}
              rows={2}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAskQuestion} 
                disabled={isAnswering || !question.trim()}
                startIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                }
              >
                Preguntar a la IA
              </Button>
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
};

export default FinancialAdvisorQA;

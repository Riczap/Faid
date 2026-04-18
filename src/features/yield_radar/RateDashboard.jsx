import { useState, useEffect } from 'react';
import PageBreadcrumb from '../../template/components/common/PageBreadCrumb';
import Badge from '../../template/components/ui/badge/Badge';
import { useFinancial } from '../../context/FinancialContext';
import { getYieldRates } from '../../services/rates.service';

// ==============================================
// CONSTANTS
// ==============================================

const PROTECTION_LIMITS = {
  ProSofipo: { amount: 200000, label: 'ProSofipo (~25k UDIs)' },
  IPAB: { amount: 3000000, label: 'IPAB (~400k UDIs)' },
  'N/A': { amount: 0, label: 'Sin Protección' }
};

// ==============================================
// TOOLTIP COMPONENT
// ==============================================
function Tooltip({ children, content }) {
  if (!content) return <>{children}</>;
  return (
    <div className="relative flex items-center group cursor-help">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 text-center leading-tight">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
      </div>
    </div>
  );
}

// ==============================================
// MATRIX LOGIC
// ==============================================

function groupRatesIntoMatrix(rates) {
  const matrix = {};

  rates.forEach(rate => {
    // Normalize base institution name
    let baseName = rate.institution_name;
    if (baseName.includes('CETES')) baseName = 'CETES';
    else if (baseName.includes('Nu ')) baseName = 'Nu México';
    else if (baseName.includes('Klar ')) baseName = 'Klar';
    else if (baseName.includes('Plata ')) baseName = 'Plata Card';
    else if (baseName.includes('Stori ')) baseName = 'Stori';
    else if (baseName.includes('Uala ')) baseName = 'Ualá';
    else if (baseName.includes('DiDi ')) baseName = 'DiDi';
    else if (baseName.includes('Openbank')) baseName = 'Openbank';
    else if (baseName.includes('Finsus')) baseName = 'Finsus';
    else if (baseName.includes('Mercado Pago')) baseName = 'Mercado Pago';
    else if (baseName.includes('Supertasas')) baseName = 'SuperTasas';
    else if (baseName.includes('Hey Banco')) baseName = 'Hey Banco';
    else if (baseName.includes('Kubo')) baseName = 'Kubo Financiero';

    if (!matrix[baseName]) {
      matrix[baseName] = {
         name: baseName,
         trust_score: rate.trust_score,
         protection_type: rate.protection_type,
         instrument_type: rate.instrument_type,
         cells: {} 
      };
    }

    // Map term to column key
    let colKey = 'vista';
    if (rate.term_days) {
       if (rate.term_days >= 28 && rate.term_days <= 31) colKey = '1mo';
       else if (rate.term_days >= 90 && rate.term_days <= 92) colKey = '3mo';
       else if (rate.term_days >= 180 && rate.term_days <= 182) colKey = '6mo';
       else if (rate.term_days >= 360 && rate.term_days <= 365) colKey = '1yr';
       else colKey = 'otro';
    }

    // Prioritize the highest max_apy if multiple fall into the same bucket
    if (!matrix[baseName].cells[colKey] || (matrix[baseName].cells[colKey].max_apy < rate.max_apy)) {
       matrix[baseName].cells[colKey] = rate;
    }
  });

  return Object.values(matrix).sort((a, b) => {
    // Sort by highest overall rate available in any bucket
    const maxA = Math.max(...Object.values(a.cells).map(r => r.max_apy ?? 0));
    const maxB = Math.max(...Object.values(b.cells).map(r => r.max_apy ?? 0));
    return maxB - maxA;
  });
}

// ==============================================
// MATRIX TABLE ROW
// ==============================================

function MatrixRow({ row, showMaxApy }) {
  const [expanded, setExpanded] = useState(false);

  // We want to aggregate all requirements for this institution across any cell
  const requirements = Object.values(row.cells)
    .filter(r => r.requirements_description)
    .map(r => r.requirements_description);
  
  const uniqueReqs = [...new Set(requirements)];

  const renderCell = (colKey) => {
    const rate = row.cells[colKey];
    if (!rate) return <span className="text-gray-300 dark:text-gray-700 font-normal">--</span>;

    const displayVal = showMaxApy ? (rate.max_apy ?? rate.annual_rate) : (rate.base_apy ?? rate.annual_rate);
    const hasReq = !!rate.requirements_description && showMaxApy && rate.base_apy !== rate.max_apy;

    // Color coding based on yield threshold
    let colorClass = "text-gray-900 dark:text-white";
    if (displayVal >= 14.0) colorClass = "text-brand-600 dark:text-brand-400 font-bold";
    else if (displayVal >= 11.0) colorClass = "text-success-600 dark:text-success-400 font-semibold";

    return (
      <div className="flex items-center justify-center gap-1.5">
        <span className={colorClass}>{displayVal.toFixed(2)}%</span>
        {hasReq && (
          <Tooltip content="Requiere condiciones (Clic en fila para ver)">
            <svg className="w-3.5 h-3.5 text-warning-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <>
      <tr 
        onClick={() => setExpanded(!expanded)}
        className="group cursor-pointer border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Institution Name */}
        <td className="py-4 pl-4 pr-3 sm:pl-6">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg border ${
              expanded 
                ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-500/20 dark:border-brand-500/30' 
                : 'bg-white border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
            } transition-colors`}>
              <svg className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                {row.name}
              </div>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                {row.instrument_type}
              </div>
            </div>
          </div>
        </td>

        {/* Rate Cells */}
        <td className="py-4 px-3 text-center text-sm">{renderCell('vista')}</td>
        <td className="py-4 px-3 text-center text-sm">{renderCell('1mo')}</td>
        <td className="py-4 px-3 text-center text-sm">{renderCell('3mo')}</td>
        <td className="py-4 px-3 text-center text-sm">{renderCell('6mo')}</td>
        <td className="py-4 px-3 text-center text-sm">{renderCell('1yr')}</td>

        {/* Insurance */}
        <td className="py-4 pr-4 pl-3 sm:pr-6 text-right">
          <Badge color={row.protection_type === 'IPAB' ? 'success' : row.protection_type === 'ProSofipo' ? 'info' : 'light'}>
            {PROTECTION_LIMITS[row.protection_type]?.label || row.protection_type}
          </Badge>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {expanded && (
        <tr>
          <td colSpan={7} className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-800/60 p-0">
            <div className="px-6 py-5 ml-10 border-l-2 border-brand-500 my-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Requirements Block */}
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    <svg className="w-4 h-4 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Requisitos para Tasa Máxima
                  </h4>
                  {uniqueReqs.length > 0 ? (
                    <ul className="space-y-2">
                      {uniqueReqs.map((req, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0"></span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay requisitos. La tasa aplica directo.</p>
                  )}
                </div>

                {/* Institutional Health Block */}
                <div className="bg-white dark:bg-white/[0.03] rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    Salud Institucional (Regulación)
                  </h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Categoría / Nivel</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{row.trust_score}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Fondo de Protección</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{row.protection_type}</span>
                  </div>
                </div>

              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ==============================================
// MAIN DASHBOARD
// ==============================================

export default function RateDashboard() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMaxApy, setShowMaxApy] = useState(true); // Default to max APY for flashiness

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getYieldRates();
        setRates(data);
      } catch (err) {
        console.error('Failed to load yield rates:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const matrixData = groupRatesIntoMatrix(rates);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Radar de Rendimientos" />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Radar de Rendimientos" />

      {/* Header & Controls Pivot */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comparador de Tasas MVP</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Matriz de rendimientos actualizada. Haz clic en cualquier fila para ver requisitos y salud institucional.
          </p>
        </div>

        {/* Global Requirement Toggle */}
        <div className="flex items-center gap-3 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 px-4 py-2.5 rounded-xl shadow-sm">
          <span className={`text-sm font-medium transition-colors ${!showMaxApy ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            Tasa Base
          </span>
          <button
            onClick={() => setShowMaxApy(!showMaxApy)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
              showMaxApy ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showMaxApy ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-medium transition-colors ${showMaxApy ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              Tasa Máxima
            </span>
            <svg className="w-4 h-4 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-error-50 text-error-600 text-sm">
          Error: {error}
        </div>
      )}

      {/* MATRIX TABLE */}
      <div className="bg-white dark:bg-gray-900 overflow-hidden shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 sm:rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th scope="col" className="py-4 pl-4 pr-3 sm:pl-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Institución
                </th>
                <th scope="col" className="py-4 px-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-100 dark:border-gray-800/50">
                  A la vista
                </th>
                <th scope="col" className="py-4 px-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-100 dark:border-gray-800/50">
                  1 Mes
                </th>
                <th scope="col" className="py-4 px-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-100 dark:border-gray-800/50">
                  3 Meses
                </th>
                <th scope="col" className="py-4 px-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-100 dark:border-gray-800/50">
                  6 Meses
                </th>
                <th scope="col" className="py-4 px-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-100 dark:border-gray-800/50">
                  1 Año
                </th>
                <th scope="col" className="py-4 pr-4 pl-3 sm:pr-6 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-l border-gray-100 dark:border-gray-800/50">
                  Seguro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-transparent">
              {matrixData.map(row => (
                <MatrixRow key={row.name} row={row} showMaxApy={showMaxApy} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
        * El icono del rayo (<span className="text-warning-500">⚡</span>) indica que la tasa requiere cumplir ciertas condiciones. 
        Haz clic en la fila de la institución para ver los detalles exactos.
      </div>
    </div>
  );
}

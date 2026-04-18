import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { extractExpensesFromPDF } from "../../services/ai.service";
import Button from "../../template/components/ui/button/Button";
import { useFinancial } from "../../context/FinancialContext";
import Badge from "../../template/components/ui/badge/Badge";
import { Modal } from "../../template/components/ui/modal";
import Checkbox from "../../template/components/form/input/Checkbox";

interface ExpensePdfUploadProps {
  onUploadComplete?: (expenses: any[]) => void;
}

export default function ExpensePdfUpload({ onUploadComplete }: ExpensePdfUploadProps) {
  const { formatCurrency, currency } = useFinancial();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // AI Extracted Data state
  const [extractedExpenses, setExtractedExpenses] = useState<any[] | null>(null);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  const processFile = async (file: File) => {
    console.log("[PDF_UPLOAD] Started processing file:", file.name, "Size:", file.size);
    setIsUploading(true);
    setUploadedFile(file);
    setErrorMsg("");
    setExtractedExpenses(null);

    try {
      console.log("[PDF_UPLOAD] Instantiating FileReader...");
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        console.log("[PDF_UPLOAD] FileReader .onloadend triggered. Reader result type:", typeof reader.result);
        try {
          if (!reader.result) throw new Error("FileReader returned null result");
          
          const base64Data = (reader.result as string).split(',')[1];
          console.log("[PDF_UPLOAD] Extracted base64 string. Length:", base64Data.length);
          
          console.log("[PDF_UPLOAD] Calling extractExpensesFromPDF()...");
          const expenses = await extractExpensesFromPDF(base64Data);
          
          console.log("[PDF_UPLOAD] AI extraction successful! Extracted records:", expenses?.length);
          setExtractedExpenses(expenses);
          if (expenses) {
            setSelectedIndexes(expenses.map((_: any, i: number) => i));
          }
        } catch (err: any) {
           console.error("[PDF_UPLOAD] CATCH HIT inside onloadend!", err);
           setErrorMsg(err.message || 'Error processing document via AI.');
           setUploadedFile(null);
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = (e) => {
         console.error("[PDF_UPLOAD] FileReader .onerror triggered!", e);
         setErrorMsg("Error leyendo el archivo.");
         setIsUploading(false);
         setUploadedFile(null);
      };
      
      console.log("[PDF_UPLOAD] Calling readAsDataURL...");
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("[PDF_UPLOAD] Sync catch block hit!", error);
      setIsUploading(false);
      setUploadedFile(null);
      setErrorMsg("Error inesperado procesando el PDF.");
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleConfirm = () => {
    if (onUploadComplete && extractedExpenses) {
      const selectedExpenses = extractedExpenses.filter((_, i) => selectedIndexes.includes(i));
      onUploadComplete(selectedExpenses);
      setExtractedExpenses(null);
      setUploadedFile(null);
      setSelectedIndexes([]);
    }
  };

  const handleCancel = () => {
    setExtractedExpenses(null);
    setUploadedFile(null);
    setSelectedIndexes([]);
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked && extractedExpenses) {
      setSelectedIndexes(extractedExpenses.map((_, i) => i));
    } else {
      setSelectedIndexes([]);
    }
  };

  const handleToggleIndex = (index: number, checked: boolean) => {
    setSelectedIndexes(prev => {
      if (checked) {
        return [...prev, index];
      } else {
        return prev.filter(i => i !== index);
      }
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] h-full flex flex-col">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        Subir Estado de Cuenta (PDF)
      </h3>

      <div className="flex-1 flex flex-col">
        {isUploading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 border border-gray-200 bg-gray-50 rounded-xl dark:bg-white/[0.02] dark:border-white/[0.05] h-full">
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Analizando PDF con Inteligencia Artificial...
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center max-w-[250px]">
                Escuchando el archivo y procesando las transacciones detectadas. Esto puede tardar unos segundos.
              </p>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer text-center
              ${
                isDragActive
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
                  : "border-gray-300 bg-gray-50 hover:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-500"
              }
            `}
          >
            <input {...getInputProps()} />
            
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <h4 className="mb-2 font-semibold text-gray-800 text-theme-lg dark:text-white/90">
              {isDragActive ? "Suelta el PDF aquí" : "Arrastra y suelta tu estado de cuenta"}
            </h4>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-[250px]">
              Sube tu archivo en formato PDF para procesar tus gastos automáticamente. Soporta hasta 15MB.
            </p>
            
            {errorMsg && (
              <p className="text-sm text-error-500 mb-4 font-medium">{errorMsg}</p>
            )}

            <Button size="sm">
              Explorar Archivo
            </Button>
          </div>
        )}
      </div>

      <Modal isOpen={!!extractedExpenses} onClose={handleCancel} className="max-w-[600px] p-6 lg:p-8">
        {extractedExpenses && (
          <div className="flex flex-col max-h-[80vh]">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Revisar Transacciones Extraídas
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Selecciona las transacciones que deseas guardar en tu registro.
              </p>
            </div>
            
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-white/[0.05]">
              <Checkbox 
                label={`Seleccionar Todas (${selectedIndexes.length} de ${extractedExpenses.length})`}
                checked={selectedIndexes.length === extractedExpenses.length && extractedExpenses.length > 0}
                onChange={handleToggleSelectAll}
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-3 mb-2">
                {extractedExpenses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No se encontraron transacciones en este documento.</p>
                ) : (
                  extractedExpenses.map((exp, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Checkbox 
                        checked={selectedIndexes.includes(idx)}
                        onChange={(checked) => handleToggleIndex(idx, checked)}
                      />
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate pr-2">{exp.concept}</span>
                          <span className="font-bold text-error-500 font-mono text-sm whitespace-nowrap">
                            {formatCurrency(exp.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <Badge color="primary">{exp.category}</Badge>
                          <span className="text-xs text-gray-500">{exp.created_at}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
              <Button onClick={handleConfirm} disabled={selectedIndexes.length === 0}>
                Guardar ({selectedIndexes.length})
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

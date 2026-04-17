import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function ExpensePdfUpload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simular progreso de subida
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setUploadProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedFile(file);
        }
      }, 200);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03] h-full flex flex-col">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        Subir Estado de Cuenta (PDF)
      </h3>

      <div className="flex-1 flex flex-col">
        {uploadedFile ? (
          <div className="flex flex-col items-center justify-center p-6 border border-success-200 bg-success-50 rounded-xl dark:bg-success-500/10 dark:border-success-500/20 h-full">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-medium text-success-800 dark:text-success-400 text-center mb-1">
              ¡Archivo cargado con éxito!
            </p>
            <p className="text-sm text-success-600 dark:text-success-500 text-center break-all">
              {uploadedFile.name}
            </p>
            <button 
              onClick={() => setUploadedFile(null)}
              className="mt-4 text-sm font-medium text-success-700 hover:text-success-800 underline dark:text-success-400 dark:hover:text-success-300"
            >
              Subir otro archivo
            </button>
          </div>
        ) : isUploading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 border border-gray-200 bg-gray-50 rounded-xl dark:bg-white/[0.02] dark:border-white/[0.05] h-full">
            <div className="w-full max-w-xs">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subiendo archivo...
                </span>
                <span className="text-sm font-medium text-brand-500">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-brand-500 h-2.5 rounded-full transition-all duration-200 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Analizando el estado de cuenta con Inteligencia Artificial
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
              Sube tu archivo en formato PDF para procesar tus gastos automáticamente.
            </p>

            <span className="inline-flex items-center justify-center rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
              Explorar Archivo
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

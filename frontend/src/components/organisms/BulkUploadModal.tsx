import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle, Download, Loader2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import { generateAndDownloadTemplate } from '../../utils/excelParser';
import { parseInventoryExcel } from '../../utils/excelParser';
import { createProducto } from '../../services/productoService';
import { useToast } from '../../context/ToastContext';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresaNit: string;
  onSuccess: () => void;
}

export const BulkUploadModal = ({ isOpen, onClose, empresaNit, onSuccess }: BulkUploadModalProps) => {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{ row: number; msg: string; type: 'success' | 'error' }[]>([]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setLogs([]);
      setProgress(0);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setLogs([]);
    
    try {
      const rows = await parseInventoryExcel(file, empresaNit);
      
      if (rows.length === 0) {
        showToast("El archivo está vacío o no tiene datos válidos", "warning");
        setLoading(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const item = rows[i];
        
        setProgress(Math.round(((i + 1) / rows.length) * 100));

        if (item.error || !item.data) {
           setLogs(prev => [...prev, { row: item.rowNumber, msg: item.error || "Error datos", type: 'error' }]);
           errorCount++;
           continue;
        }

        try {
          await createProducto(item.data);
          // setLogs(prev => [...prev, { row: item.rowNumber, msg: `"${item.data?.nombre}" creado`, type: 'success' }]);
          successCount++;
        } catch (error: any) {
          const errMsg = error.response?.data?.codigo ? "Código ya existe" : "Error al guardar";
          setLogs(prev => [...prev, { row: item.rowNumber, msg: `${errMsg} (${item.data?.codigo})`, type: 'error' }]);
          errorCount++;
        }
      }

      showToast(`Proceso finalizado. Exitosos: ${successCount}, Errores: ${errorCount}`, successCount > 0 ? 'success' : 'error');
      
      if (successCount > 0) {
        onSuccess(); 
      }

    } catch (err) {
      console.error(err);
      showToast("Error procesando el archivo Excel", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileSpreadsheet className="text-[#E6C200]" /> Carga Masiva Excel
            </h2>
            {!loading && (
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
            )}
        </div>

        {/* Body */}
        <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
            
            {/* Paso 1: Descargar Plantilla */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800 mb-3 font-medium">1. Descarga la plantilla obligatoria:</p>
                <Button 
                    variant="outline" 
                    onClick={generateAndDownloadTemplate} 
                    className="w-full bg-white text-blue-700 border-blue-200 hover:bg-blue-50 h-10"
                    icon={<Download size={16}/>}
                >
                    Descargar Plantilla Excel
                </Button>
            </div>

            {/* Paso 2: Subir Archivo */}
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${file ? 'border-[#E6C200] bg-yellow-50/30' : 'border-gray-300 hover:border-gray-400'}`}>
                <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleFileChange}
                    disabled={loading}
                    className="hidden" 
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    {file ? (
                        <>
                            <FileSpreadsheet size={32} className="text-[#E6C200]"/>
                            <span className="font-bold text-gray-700 text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">Click para cambiar</span>
                        </>
                    ) : (
                        <>
                            <UploadCloud size={32} className="text-gray-400"/>
                            <span className="text-sm text-gray-600 font-medium">Click para seleccionar archivo</span>
                            <span className="text-xs text-gray-400">Formatos: .xlsx</span>
                        </>
                    )}
                </label>
            </div>

            {/* Progreso y Logs */}
            {loading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                        <span>Procesando...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-[#E6C200] h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {/* Resultados / Errores */}
            {logs.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto text-xs border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-2 sticky top-0 bg-gray-50">Reporte:</h4>
                    {logs.map((log, idx) => (
                        <div key={idx} className={`flex gap-2 mb-1 ${log.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                            {log.type === 'error' ? <AlertTriangle size={12} className="mt-0.5"/> : <CheckCircle size={12} className="mt-0.5"/>}
                            <span>Fila {log.row}: {log.msg}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
            <Button 
                onClick={onClose} 
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                disabled={loading}
            >
                {loading ? 'Cancelar' : 'Cerrar'}
            </Button>
            <Button 
                onClick={handleProcess} 
                variant="primary" 
                className="flex-1"
                disabled={!file || loading}
                icon={loading ? <Loader2 size={18} className="animate-spin"/> : <UploadCloud size={18}/>}
            >
                {loading ? 'Subiendo...' : 'Procesar Excel'}
            </Button>
        </div>
      </div>
    </div>
  );
};
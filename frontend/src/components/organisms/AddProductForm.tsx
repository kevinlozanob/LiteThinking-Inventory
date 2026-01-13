import React, { useState, useRef } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { createProducto, generarDescripcionIA } from '../../services/productoService';
import { Wand2, X, Mic, Square, Loader2 } from 'lucide-react'; 
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiErrors';
import api from '../../services/api';

interface Props {
  empresaNit: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddProductForm = ({ empresaNit, onSuccess, onCancel }: Props) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ 
    codigo: '', nombre: '', caracteristicas: '', moneda: 'USD', precio: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  
    const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const handleMicClick = async () => {
    if (isRecording) {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            stream.getTracks().forEach(track => track.stop());
            
            const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
            
            if (audioBlob.size < 1000) { 
                showToast(
                    "El audio fue muy corto o hubo silencio.", 
                    'warning', 
                    "No te escuché bien"
                );
                return;
            }

            await sendAudioToBackend(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        showToast("Grabando... Haz clic para terminar.", 'info');

    } catch (err) {
        console.error(err);
        showToast("No se pudo acceder al micrófono.", 'error');
    }
  };

  const sendAudioToBackend = async (blob: Blob) => {
    setIsProcessingVoice(true);
    const audioFile = new File([blob], "comando_voz.webm", { type: 'audio/webm' });
    const formDataAudio = new FormData();
    formDataAudio.append('audio', audioFile);

    try {
        const response = await api.post('productos/interpretar_voz/', formDataAudio, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        const data = response.data;
        
        setFormData({
            codigo: data.codigo || '',
            nombre: data.nombre || '',
            caracteristicas: data.caracteristicas || '',
            moneda: data.moneda || 'COP',
            precio: data.precio ? String(data.precio) : ''
        });
        
        showToast(
            "He rellenado el formulario con lo que dijiste.", 
            'success', 
            "¡Audio Procesado!"
        );
    } catch (error) {
        console.error(error);
        showToast(
            "Hubo ruido de fondo o no entendí los datos.", 
            'error', 
            "Intenta dictar más despacio"
        );
    } finally {
        setIsProcessingVoice(false);
    }
  };

  const handleAI = async () => {
    if (!formData.nombre) {
        showToast("Escribe un nombre del producto primero", 'info');
        return;
    }
    setGeneratingAI(true);
    try {
      const desc = await generarDescripcionIA(formData.nombre);
      setFormData(prev => ({ ...prev, caracteristicas: desc }));
      showToast("Descripción generada automáticamente.", 'success');
    } catch (err) {
      showToast("Error contactando a la IA", 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const numericPrice = parseFloat(formData.precio);
      const preciosJSON = { [formData.moneda]: numericPrice };
      await createProducto({
        codigo: formData.codigo,
        nombre: formData.nombre,
        caracteristicas: formData.caracteristicas,
        empresa: empresaNit,
        precios: preciosJSON
      });
      showToast(
        `El producto "${formData.nombre}" ha sido añadido al inventario correctamente.`, 
        'success', 
        "Producto Creado"
      );
      onSuccess();
    } catch (err) {
      const message = getErrorMessage(err);
      showToast(
        message, 
        'error', 
        "Error al procesar solicitud"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-lg font-bold text-gray-800">Nuevo Producto</h3>
            
            {/* BOTÓN DE GRABACIÓN */}
            <button
                type="button"
                onClick={handleMicClick}
                disabled={isProcessingVoice}
                className={`
                    flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border select-none w-fit
                    ${isRecording 
                        ? 'bg-red-600 text-white border-red-700 animate-pulse shadow-lg shadow-red-200' 
                        : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200 shadow-sm'}
                    ${isProcessingVoice ? 'opacity-70 cursor-wait' : ''}
                `}
            >
                {isProcessingVoice ? (
                    <Loader2 size={14} className="animate-spin"/>
                ) : isRecording ? (
                    <Square size={14} fill="currentColor"/>
                ) : (
                    <Mic size={14}/>
                )}
                
                <span className="hidden sm:inline">
                    {isProcessingVoice ? 'Procesando...' : isRecording ? 'Parar Grabación' : 'Dictar por Voz'}
                </span>
                <span className="sm:hidden">
                    {isProcessingVoice ? '...' : isRecording ? 'Parar' : 'Voz'}
                </span>
            </button>
        </div>

        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 sm:hidden">
          <X size={20}/>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* FILA 1: CÓDIGO Y NOMBRE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Código / SKU"
              helpText="Identificador único. Use letras, números y guiones. Sin espacios. Ej: PROD-001"
              placeholder="Ej: PROD-001" 
              value={formData.codigo}
              onChange={e => setFormData({...formData, codigo: e.target.value})}
              required 
            />
            <Input 
              label="Nombre del Producto"
              helpText="Nombre claro para el inventario. Evite nombres genéricos duplicados."
              placeholder="Ej: Teclado Mecánico RGB" 
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              required 
            />
        </div>
        
        {/* FILA 2: CARACTERÍSTICAS (TEXTAREA) */}
        <div className="relative">
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Características
          </label>
          <textarea
            className="w-full p-3 pb-12 sm:pb-3 sm:pr-36 rounded-lg border border-gray-200 focus:outline-none focus:border-[#E6C200] focus:ring-4 focus:ring-[#E6C200]/20 text-sm resize-none transition-all shadow-sm"
            rows={3}
            placeholder="Describa el producto..."
            value={formData.caracteristicas}
            onChange={e => setFormData({...formData, caracteristicas: e.target.value})}
            required
          />
          <button
            type="button"
            onClick={handleAI}
            disabled={generatingAI}
            className="absolute bottom-3 right-3 sm:top-9 sm:bottom-auto flex items-center gap-1 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-purple-700 disabled:opacity-50 shadow-md transition-colors"
          >
            <Wand2 size={12} className={generatingAI ? "animate-spin" : ""} />
            {generatingAI ? "Generando..." : "Autocompletar con IA"}
          </button>
        </div>

        {/* FILA 3: PRECIO Y MONEDA */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Moneda</label>
                <select 
                    className="w-full h-[44px] sm:h-[48px] rounded-lg border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:border-[#E6C200] focus:ring-4 focus:ring-[#E6C200]/20 cursor-pointer shadow-sm"
                    value={formData.moneda}
                    onChange={e => setFormData({...formData, moneda: e.target.value})}
                >
                    <option value="USD">USD (Dólar)</option>
                    <option value="COP">COP (Peso)</option>
                    <option value="EUR">EUR (Euro)</option>
                </select>
            </div>

            {/* Precio (Input) */}
            <div className="sm:col-span-2">
                <Input 
                    label="Valor Unitario"
                    helpText="Precio numérico. Debe ser mayor a 0. No use signos de moneda. Ej: 25000"
                    placeholder="0.00" 
                    type="number"
                    value={formData.precio}
                    onChange={e => setFormData({...formData, precio: e.target.value})}
                    required 
                />
            </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200 sm:justify-end">
          <Button 
            type="button" 
            onClick={onCancel} 
            className="bg-white hover:bg-gray-50 w-full sm:w-auto px-6 text-gray-700 border border-gray-300"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading} 
            className="w-full sm:w-auto px-8 shadow-md"
          >
            {loading ? "Guardando..." : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
};
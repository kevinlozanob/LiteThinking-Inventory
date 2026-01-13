import React, { useState, useRef } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { createProducto, generarDescripcionIA } from '../../services/productoService';
import { Wand2, X, Mic, Square, Loader2 } from 'lucide-react'; 
import { useToast } from '../../context/ToastContext';
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
  // -------------------------------------

  const handleAI = async () => {
    if (!formData.nombre) {
        showToast("Escribe un nombre primero", 'info');
        return;
    }
    setGeneratingAI(true);
    try {
      const desc = await generarDescripcionIA(formData.nombre);
      setFormData(prev => ({ ...prev, caracteristicas: desc }));
      showToast("Descripción generada", 'success');
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
      const preciosJSON = { [formData.moneda]: parseFloat(formData.precio) };
      await createProducto({
        codigo: formData.codigo,
        nombre: formData.nombre,
        caracteristicas: formData.caracteristicas,
        empresa: empresaNit,
        precios: preciosJSON
      });
      showToast(
        `El producto "${formData.nombre}" ya está en la lista.`, 
        'success', 
        "Producto Guardado"
      );
      onSuccess();
    } catch (err) {
      showToast(
        "Verifica que el código no esté repetido.", 
        'error', 
        "No se pudo guardar"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 animate-[fadeIn_0.3s_ease-out]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">Nuevo Producto</h3>
            
            {/* BOTÓN DE GRABACIÓN TOGGLE */}
            <button
                type="button"
                onClick={handleMicClick}
                disabled={isProcessingVoice}
                className={`
                    flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all border select-none
                    ${isRecording 
                        ? 'bg-red-600 text-white border-red-700 animate-pulse shadow-lg shadow-red-200' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'}
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
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
        <Input 
          placeholder="Código" 
          value={formData.codigo}
          onChange={e => setFormData({...formData, codigo: e.target.value})}
          required 
        />
        <Input 
          placeholder="Nombre Producto" 
          value={formData.nombre}
          onChange={e => setFormData({...formData, nombre: e.target.value})}
          required 
        />
        
        <div className="sm:col-span-2 relative">
          <textarea
            className="w-full p-3 pb-12 sm:pb-3 sm:pr-36 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E6C200] text-sm resize-none transition-all"
            rows={3}
            placeholder="Características..."
            value={formData.caracteristicas}
            onChange={e => setFormData({...formData, caracteristicas: e.target.value})}
            required
          />
          <button
            type="button"
            onClick={handleAI}
            disabled={generatingAI}
            className="absolute bottom-3 right-3 sm:top-3 sm:bottom-auto flex items-center gap-1 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-purple-700 disabled:opacity-50 shadow-sm"
          >
            <Wand2 size={12} className={generatingAI ? "animate-spin" : ""} />
            {generatingAI ? "Generando..." : "Autocompletar"}
          </button>
        </div>

        <div className="flex gap-2 sm:col-span-1">
            <select 
                className="rounded border border-gray-200 px-2 sm:px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E6C200] min-w-[70px]"
                value={formData.moneda}
                onChange={e => setFormData({...formData, moneda: e.target.value})}
            >
                <option value="USD">USD</option>
                <option value="COP">COP</option>
                <option value="EUR">EUR</option>
            </select>
            <Input 
                placeholder="Precio" 
                type="number"
                value={formData.precio}
                onChange={e => setFormData({...formData, precio: e.target.value})}
                required 
            />
        </div>

        <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-2 sm:justify-end">
          <Button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 w-full sm:w-auto px-4 text-gray-700 border border-gray-300 hidden sm:flex">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto px-6 shadow-sm">
            {loading ? "Guardando..." : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
};
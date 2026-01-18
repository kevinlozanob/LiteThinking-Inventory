import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Trash2, ChevronDown } from 'lucide-react';
import { chatWithInventory } from '../../services/productoService';
import ReactMarkdown from 'react-markdown';

interface ChatWidgetProps {
  empresaNit: string;
  onOpenChange?: (isOpen: boolean) => void;
}

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export const ChatWidget = ({ empresaNit, onOpenChange }: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "¡Hola! Soy **LiteBot**. \n\nPuedo analizar tu inventario, calcular presupuestos en USD/COP/EUR o buscar productos por código.\n\n¿En qué te ayudo hoy?", 
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleChat = () => {
      const newState = !isOpen;
      setIsOpen(newState);
      if (onOpenChange) {
          onOpenChange(newState);
      }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
        setTimeout(() => inputRef.current?.focus(), 100); 
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    
    // Optimistic UI Update
    const newHistory = [...messages, { id: Date.now(), text: userMsg, isBot: false, timestamp: new Date() }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const historialParaEnviar = newHistory.slice(-15).map(m => ({
        role: m.isBot ? 'assistant' : 'user',
        content: m.text
      }));

      const respuesta = await chatWithInventory(empresaNit, historialParaEnviar as any);
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: respuesta, isBot: true, timestamp: new Date() }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Error de conexión. Intenta de nuevo.", isBot: true, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
      setMessages([{ 
        id: Date.now(), 
        text: "Chat reiniciado. ¿En qué te puedo ayudar ahora?", 
        isBot: true,
        timestamp: new Date()
      }]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[9999] flex flex-col items-end font-sans pointer-events-none">
      
      {/* --- VENTANA DEL CHAT --- */}
      <div className={`
        transition-all duration-300 ease-in-out transform origin-bottom-right
        ${isOpen ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}
        
        fixed inset-0 sm:inset-auto sm:relative 
        w-full h-full sm:w-[400px] sm:h-[600px] 
        bg-white sm:rounded-2xl shadow-2xl 
        flex flex-col overflow-hidden
        border border-gray-100
        
        /* CAMBIO CLAVE 2: 'pointer-events-auto' para poder interactuar con el chat */
        pointer-events-auto
      `}>
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#E6C200] to-[#F4D03F] p-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-inner">
               <Bot size={24} className="text-black drop-shadow-sm" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900 leading-tight flex items-center gap-1">
                    LiteBot
                </h3>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-yellow-900/80 font-medium">Online & Ready</span>
                </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button 
                onClick={clearChat} 
                title="Limpiar chat"
                className="p-2 hover:bg-black/10 rounded-full transition-colors text-yellow-900"
            >
                <Trash2 size={18} />
            </button>
            <button 
                onClick={toggleChat} 
                className="p-2 hover:bg-black/10 rounded-full transition-colors text-yellow-900"
            >
                {window.innerWidth < 640 ? <ChevronDown size={24} /> : <X size={20} />}
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F9FAFB] space-y-4 scroll-smooth">
            <div className="text-center">
                <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 uppercase tracking-wider font-semibold">
                    Powered by Nicklcs
                </span>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-[fadeIn_0.3s_ease-out]`}>
                {msg.isBot && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#E6C200] flex items-center justify-center mr-2 mt-auto shadow-sm flex-shrink-0">
                        <Bot size={14} className="text-black sm:w-4 sm:h-4"/>
                    </div>
                )}
                <div className={`
                    max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group
                    ${msg.isBot 
                        ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-none' 
                        : 'bg-black text-white rounded-br-none from-gray-900 to-black bg-gradient-to-br'
                    }
                `}>
                  <div className={`
                        prose prose-sm max-w-none 
                        ${msg.isBot ? 'prose-headings:text-gray-800 prose-strong:text-black' : 'prose-invert prose-p:text-gray-100'}
                        prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:font-bold
                  `}>
                    {msg.isBot ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                  </div>
                  <span className={`
                    text-[10px] absolute -bottom-5 min-w-[60px] opacity-0 group-hover:opacity-100 transition-opacity
                    ${msg.isBot ? 'left-0 text-gray-400' : 'right-0 text-gray-400 text-right'}
                  `}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-[fadeIn_0.3s_ease-out]">
                 <div className="w-8 h-8 rounded-full bg-[#E6C200] flex items-center justify-center mr-2 shadow-sm">
                    <Bot size={14} className="text-black"/>
                </div>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* FOOTER */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input 
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre precios, stock..."
              className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6C200] focus:bg-white transition-all duration-200 shadow-inner"
              disabled={loading}
            />
            <button 
                type="submit" 
                disabled={loading || !input.trim()} 
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 ${loading || !input.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#E6C200] text-black hover:bg-[#D4B200] hover:scale-105 shadow-md active:scale-95'}`}
            >
              {loading ? (<div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>) : (<Send size={18} className={input.trim() ? 'ml-0.5' : ''}/>)}
            </button>
          </form>
          <div className="text-center mt-2 hidden sm:block">
            <p className="text-[10px] text-gray-400">La IA puede cometer errores. Verifica los precios importantes.</p>
          </div>
        </div>
      </div>

      <button 
        onClick={toggleChat}
        className={`
            group relative pointer-events-auto
            flex items-center justify-center
            w-14 h-14 sm:w-16 sm:h-16 
            bg-[#E6C200] hover:bg-[#F4D03F] text-black 
            rounded-full shadow-[0_8px_30px_rgb(230,194,0,0.4)] 
            border-[3px] border-white 
            transition-all duration-300 ease-in-out
            hover:scale-110 active:scale-95
            ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}
        `}
      >
        <MessageSquare size={28} className="transition-transform group-hover:-translate-y-1 group-hover:rotate-[-10deg]" fill="black" />
        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce"></span>
      </button>

        {/* Botón de cierre externo */}
       <button 
        onClick={toggleChat}
        className={`
            fixed bottom-4 right-4 sm:bottom-8 sm:right-8
            w-14 h-14 sm:w-16 sm:h-16 
            bg-white text-gray-600 hover:text-red-500
            rounded-full shadow-lg border border-gray-100
            flex items-center justify-center
            transition-all duration-300 z-[9998]
            pointer-events-auto
            ${isOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-[-90deg] pointer-events-none'}
        `}
      >
         <ChevronDown size={32} />
      </button>

    </div>
  );
};
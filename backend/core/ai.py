from decouple import config
from groq import Groq
import json

def generar_descripcion_ia(nombre_producto, caracteristicas_basicas):

    api_key = config('GROQ_API_KEY', default=None)
    
    if not api_key:
        return "Error: API Key de Groq no configurada (Backend)."
        
    try:
        client = Groq(api_key=api_key)
        
        prompt = f"""
        Actúa como un experto en copywriting para e-commerce.
        Crea una descripción corta, persuasiva y emocionante (máximo 40 palabras) para vender este producto:
        Nombre: {nombre_producto}
        Características: {caracteristicas_basicas}
        
        IMPORTANTE: Responde SOLO con el texto plano. NO uses comillas en tu respuesta.

        """
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
        )
        
        return chat_completion.choices[0].message.content.strip()
        
    except Exception as e:
        return f"Error al consultar IA: {str(e)}"
    
def analizar_texto_producto(texto_voz):
    api_key = config('GROQ_API_KEY', default=None)
    if not api_key: return None

    try:
        client = Groq(api_key=api_key)
        prompt = f"""
        Eres un asistente de inventario. Extrae información del siguiente texto y devuélvela EXCLUSIVAMENTE en formato JSON.
        Texto: "{texto_voz}"
        Formato JSON requerido:
        {{
            "nombre": "string o null",
            "codigo": "string o null",
            "caracteristicas": "string",
            "precio": number,
            "moneda": "COP" (default)
        }}
        """
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print(f"Error IA Llama: {str(e)}")
        return None

def procesar_audio_con_ia(archivo_audio):
    api_key = config('GROQ_API_KEY', default=None)
    if not api_key: return None

    try:
        client = Groq(api_key=api_key)
        
        transcription = client.audio.transcriptions.create(
            file=(archivo_audio.name, archivo_audio.read()),
            model="whisper-large-v3", 
            language="es",
            temperature=0.0
        )
        
        texto_transcrito = transcription.text
        print(f"🎤 Texto detectado por Whisper: {texto_transcrito}")
        
        return analizar_texto_producto(texto_transcrito)

    except Exception as e:
        print(f"Error IA Audio: {str(e)}")
        return None
from decouple import config
from groq import Groq

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
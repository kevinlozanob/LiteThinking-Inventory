# Sistema de Gestión de Inventario - Lite Thinking

Esta solución implementa un sistema de gestión de inventario full-stack orientado a producción, diseñado bajo Clean Architecture y Domain-Driven Design para garantizar desacoplamiento estricto, testeabilidad y evolución controlada del dominio.

## Información de Despliegue

La aplicación se encuentra desplegada en un entorno de producción utilizando Nginx como proxy reverso y Gunicorn como servidor de aplicaciones, asegurado mediante SSL.

*   **URL de Producción:** https://litethinking.nicklcs.dev
*   **Documentación API:** https://litethinking.nicklcs.dev/api/docs/


## Arquitectura y Diseño Técnico

El proyecto se estructura separando la lógica de negocio de la infraestructura tecnológica, garantizando mantenibilidad y escalabilidad.

### 1. Capa de Dominio (`/core-domain`)
*   **Aislamiento:** Contiene las  entidades y reglas de negocio.
*   **Gestión de Dependencias:** Se utiliza **Poetry** para la gestión de paquetes y entorno virtual de esta capa, cumpliendo con el estándar moderno de Python (`pyproject.toml`).
*   **Integración:** El Backend consume esta capa tratándola como una librería externa instalada, forzando el desacoplamiento estricto.

### 2. Capa de Infraestructura (`/backend`)
*   **Framework:** Django y Django REST Framework.
*   **Base de Datos:** PostgreSQL.
*   **Autenticación:** Implementación de JWT con rotación de tokens.
*   **Integración IA:** Diseño e implementación de adaptadores desacoplados para la orquestación de modelos LLM (Llama 3) y pipelines de Speech-to-Text (Whisper), integrados como servicios de dominio consumibles por la plataforma.

### 3. Capa de Presentación (`/frontend`)
*   **Stack:** React, TypeScript y Vite.
*   **Estilos:** TailwindCSS bajo metodología Atomic Design.
---

## Funcionalidad Adicional (Propuesta Técnica)

Se implementó un módulo de **Asistente Inteligente de Inventario**.

*   **Justificación Técnica:** En entornos logísticos, la entrada de datos manual puede ser ineficiente. Se integró un modelo de procesamiento de lenguaje natural para permitir consultas complejas sobre el stock y conversión de divisas en tiempo real.
*   **Tecnología:** Procesamiento de voz a texto  y generación de respuestas contextuales mediante Inteligencia Artificial.

---

## Ejecución Local

Para replicar el entorno de desarrollo:

### Requisitos Previos
*   Docker y Docker Compose
*   Git

### Instrucciones

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/kevinlozanob/LiteThinking-Inventory.git
    cd LiteThinking-Inventory
    ```

2.  **Configurar variables de entorno:**
    Configurar variables de entorno a partir de .env.example.


3.  **Desplegar con Docker:**
    ```bash
    docker compose up --build
    ```

4.  **Acceso:**
    *   Frontend: `http://localhost:5173`
    *   Backend: `http://localhost:8000`

---

**Desarrollado por:** Nicolás Lozano (Nicklcs) Lite Thinking
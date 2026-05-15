# Stack Tecnológico de GuppyLandia

## Framework y Motor
- **Astro v6.3.3:** Generador de sitios estáticos (SSG) y dinámicos (SSR). Se prefiere el uso de componentes `.astro`.
- **Node.js v22+:** Entorno de ejecución para el desarrollo.

## Estilos y UI
- **Tailwind CSS v4:** Motor de estilos principal. Configuración centralizada en `src/styles/global.css` usando `@import "tailwindcss";`.
- **Vanilla CSS:** Utilizado para animaciones personalizadas (burbujas, floats) y máscaras de imagen (`mask-image`).
- **FontAwesome 6.5.1:** Set de iconos para la interfaz.

## Infraestructura y Datos
- **Cloudflare Pages:** Plataforma de despliegue.
- **Cloudflare D1 (Planificado):** Base de datos SQL nativa de Cloudflare para gestión de inventario real.

## Librerías de Astro Clave
- **ClientRouter:** Se utiliza para transiciones suaves entre páginas (reemplaza al antiguo ViewTransitions).

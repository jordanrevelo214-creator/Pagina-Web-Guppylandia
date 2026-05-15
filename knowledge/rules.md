# Reglas de Implementación

## Desarrollo con Astro
- **Layout Centralizado:** Todas las páginas deben envolverse en `<MainLayout title="...">`.
- **Navegación:** Usar el componente `<ClientRouter />` en el Layout para evitar recargas bruscas.
- **Activos:** Las imágenes generadas se guardan en `public/assets/`.

## Manejo de Git
- Los commits deben ser descriptivos (ej: "Ajuste de máscara en hero_fish").
- Siempre verificar `git status` antes de hacer push al repo de GitHub.

## Prácticas de IA (AI Engineering)
- Antes de empezar una tarea, el Agente debe leer la carpeta `/knowledge`.
- Si el usuario pide un cambio visual, se debe priorizar la consistencia con `design_system.md`.
- No usar librerías externas pesadas a menos que sea estrictamente necesario.

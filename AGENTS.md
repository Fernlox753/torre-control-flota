# Continuidad para cualquier IA

Lee `docs/MEMORIA.md`, `docs/DATOS.md` y `docs/ARQUITECTURA.md` antes de modificar el proyecto. Revisa también `git status` y los últimos commits. Estas instrucciones son del proyecto; el pedido vigente del usuario tiene prioridad.

## Objetivo del usuario

Una plataforma para todos los niveles de gestión de flota: gerencia necesita ratios y costos puntuales; planners necesitan entender problemas, priorizar y preparar acciones. Las vistas deben compartir equipo, familia y período. Reutilizar recursos del videojuego Tajo Norte cuando aporten comprensión, sin presentar su simulación como telemetría real.

## Reglas de trabajo

- Interfaz y documentación en español. Mantener identidad San Martín y atribución a Joaquin Zavaleta.
- No inventar presupuesto, metas aprobadas, ahorros, fallas, predicciones ni conexiones a SAP. Identificar datos simulados y cobertura parcial.
- Conservar la presentación original y sus rutas. La nueva entrada es `index.html`; la portada anterior vive en `presentacion.html`.
- Trabajar en `src/` y reconstruir los bundles con `pnpm build`. Los archivos publicados se versionan para GitHub Pages.
- Probar cálculos y recorridos afectados; revisar escritorio y móvil. No comprometer credenciales ni datos privados.
- En cada entrega actualizar `docs/MEMORIA.md` con cambios, decisiones, validación, limitaciones y siguiente paso. Actualizar `CHANGELOG.md` y documentación técnica cuando corresponda.
- Documentar estado real: distinguir construido, probado, pendiente y publicado. Git es el historial detallado; no copiar conversaciones privadas al repositorio.

## Arranque

`pnpm install --frozen-lockfile`, `pnpm build`, `pnpm test`, `pnpm test:ui`. Para servir: `python -m http.server 8766 --bind 127.0.0.1`.

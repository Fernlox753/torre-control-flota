# Arquitectura y operación

## Estructura

```text
index.html                    Estructura accesible de la plataforma
assets/platform.css           Identidad visual y adaptación de pantalla
assets/data/cierre-2026-08.json Fuente extraída del proyecto original
assets/images/                Imágenes y marca de Tajo Norte
assets/models/                Camión, pala y tractor GLB (8–11 MB cada uno)
assets/build/                 Bundles de publicación generados por esbuild
src/app.js                    Vistas, rutas, filtros, acciones y exportación
src/analytics.js              Funciones puras de métricas y validación
src/viewer.js                 Visor Three.js; carga dinámica
tests/analytics.test.mjs       Casos de negocio y contrato de importación
tests/ui.cjs                  Navegación y pruebas de navegador
presentacion.html             Portada original conservada
escala.html ... cierre.html    Capítulos originales
docs/                         Memoria, contratos y validación
```

## Estado y rutas

Aplicación estática sin framework ni servidor de aplicación. Los datos se incluyen en el bundle. El hash expresa la vista y opcionalmente el filtro/equipo: `#equipos?familia=all&equipo=FC-104`.

Cambiar de vista conserva el filtro y el equipo mientras sean válidos para ese alcance. Una familia sin detalle presenta estado vacío. La búsqueda, el foco y la referencia de disponibilidad viven en memoria durante la sesión; no se guardan como metas.

Las acciones se guardan por origen del navegador. La versión local y GitHub Pages son orígenes distintos, por lo que se necesita exportación/importación para trasladarlas. No se envían a GitHub ni a terceros. La importación no borra acciones existentes.

## Visor

`app.js` importa el módulo de visor solo al activar 3D. Este carga un único GLB y usa `GLTFLoader`, `OrbitControls` y las animaciones incluidas en el archivo. No requiere Rapier ni el motor de física del juego.

El render estático se actualiza al mover la cámara o redimensionar. La animación corre solo al solicitarla y se suspende al ocultar la pestaña. Al cambiar vista o modelo se liberan controles, observadores, geometrías, materiales, texturas y contexto WebGL. Un contador invalida resultados de cargas antiguas para evitar insertar un modelo en una pantalla reemplazada.

Se limita la densidad de píxel a 1.5. La imagen alternativa y los costos están disponibles aunque el recurso GLB o WebGL fallen. Hay botones de rotación, zoom y restablecimiento para quien no use gestos de ratón.

## Dependencias y build

Three.js 0.170.0 coincide con Tajo Norte. esbuild 0.24.0 genera bundles ES modules con división de código. Playwright se usa solo para validación. pnpm y el lockfile fijan las dependencias; `pnpm-workspace.yaml` permite el instalador de esbuild.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm test:ui
```

`tests/ui.cjs` levanta su propio servidor HTTP temporal en `127.0.0.1` y lo cierra al terminar. Usa Chrome; la variable `PLAYWRIGHT_CHANNEL` permite otro canal disponible. Las capturas, exportaciones de prueba y resultados temporales van a `test-results/`, ignorado por Git.

Para revisión manual: `python -m http.server 8766 --bind 127.0.0.1` desde la raíz. Los modelos necesitan HTTP. No abrir con `file://`.

## Publicar y revertir

GitHub Pages está configurado en `main`, carpeta `/`. Publicar fuentes y `assets/build/` del mismo build. Las rutas relativas permiten servir bajo `/torre-control-flota/`. La presentación original mantiene dependencias CDN; la plataforma nueva sirve localmente todos sus recursos de ejecución.

Antes de subir: `git diff --check`, pruebas relevantes, revisión visual y memoria actualizada. Comprobar después el commit remoto, la compilación de Pages y la página HTTP publicada. Una corrección o reversión debe ser un nuevo commit; no reescribir el historial compartido.

Para recuperar la experiencia anterior, enlazar `presentacion.html`, o revertir el commit de plataforma si el usuario lo solicita. El commit inicial `b21d51e` preserva el estado anterior completo.

## Límites técnicos pendientes

No hay autenticación, autorización por rol, persistencia central, sincronización multiusuario, API ERP/CMMS, carga de nuevos cierres, comparación entre períodos ni pipeline CI. Los capítulos anteriores conservan código duplicado y no se migraron en esta entrega. La relación sistema ↔ piezas GLB requiere un contrato nuevo; no debe inferirse de nombres similares.

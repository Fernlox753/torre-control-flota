# Memoria de trabajo — Torre de Control de Flota

## Dirección vigente · 2026-09-15

El usuario rechazó el aspecto del panel v0.2 como entrada y pidió acercarse al [Artifact de Claude](https://claude.ai/code/artifact/4e4c3e2e-0a7b-4667-a6cb-c522ed4321a0), para concentrar el trabajo en mejorar los diseños 3D. Esta decisión reemplaza la preferencia anterior por el panel como portada. Se revisó la referencia en navegador y se reutilizaron los capítulos existentes para reconstruir su recorrido continuo.

**Construido:** `index.html` reúne las ocho secciones con su composición original. `gestion.html` conserva las herramientas de v0.2. Los capítulos históricos siguen disponibles. El camión conserva el mapa procedural de sistemas y añade rodadura geométrica, llantas más anchas, rejilla, pasamanos, mangueras, cristales, iluminación, acabado realista, apertura ilustrativa de tolva y controles de cámara por botón/teclado. El terreno tiene mayor resolución. No se modificaron cifras ni los GLB de Tajo Norte.

**Fuentes:** editar `src/relato.html`, `src/relato.css`, `src/relato.js`; ejecutar `pnpm build:relato`. El build completo también reconstruye el relato. Su fuente de datos sigue siendo `assets/data/cierre-2026-08.json`. La copia local de Three.js r128 tiene atribución MIT.

**Probado:** ocho tests de cálculo aprobados. Suite de navegador aprobada en Edge con Playwright disponible en el runtime: recorrido continuo, 48 equipos, cambio de materiales, apertura de tolva, costo/OT de MOTOR1, retorno desde esquema a camión, teclado, visor dentro de su contenedor a 390/768/1440 px y alternativa sin Three.js. También pasaron los recorridos de gestión, tres GLB, animaciones, acciones, importación/exportación y fallback. Revisión visual de portada y camión en escritorio y móvil. Resultados/capturas en `test-results/` (no versionados).

**Limitaciones de validación:** `pnpm install --frozen-lockfile` no pudo descargar desde npm por errores de conexión. Se reconstruyó el relato mediante su script de Node sin dependencias nuevas; los bundles de gestión existentes se conservaron y probaron. El build completo de gestión no se volvió a ejecutar. Tests unitarios ejecutados sin aislamiento de procesos por restricciones del entorno.

**Alcance 3D:** camión genérico, no réplica de fabricante. La tolva abierta ilustra inspección; no es una simulación cinemática certificada. Equipos de otras familias siguen mostrando esquemas. Datos y limitaciones históricas permanecen vigentes. La siguiente mejora visual puede concentrarse en modelos por familia sin cambiar esta dirección de interfaz.

**Estado:** propuesta local en la rama `codex/relato-3d`; no desplegada sobre `main`. La versión pública sigue siendo v0.2 hasta que se integre esta propuesta.

---
## Historial de la entrega anterior

Actualizada: **2026-09-13 · v0.2.0**. Este documento es el punto de continuidad entre personas, chats y herramientas de IA. Leer junto con `AGENTS.md`, el contrato de datos y `git log`.

## 1. Objetivo acordado

El usuario quiere mejorar el proyecto `Fernlox753/torre-control-flota` y aprovechar los recursos del videojuego de equipos mineros creado anteriormente, **Tajo Norte**.

La plataforma debe servir a todos los niveles. Gerencia necesita ver ratios y costos puntuales; planners necesitan saber dónde investigar y cómo preparar acciones. El detalle debe ser útil también para mantenimiento. La solución debe combinar esas necesidades con la propuesta de incorporar modelos 3D y navegación más clara.

El usuario pidió explícitamente **dejar memoria de lo trabajado y modificado en el mismo GitHub**, para que cualquier IA pueda retomarlo. No guardar credenciales, datos privados ni volcados de conversaciones.

## 2. Punto de partida

- Repositorio original: commit `b21d51e`, ocho páginas HTML con CSS, datos y JavaScript repetidos.
- Funcionaba como una presentación narrativa por capítulos: tajo, escala, costo, en vivo, consola, máquina, artículo y cierre.
- Tenía una representación procedural de camión con Three.js r128 y datos incrustados en `DATA`.
- GitHub Pages publica `main` desde la raíz.
- Tajo Norte aporta modelos GLB originales: MH145, PS50FS y TD50, imágenes y animaciones; Three.js 0.170.0.

## 3. Decisiones de producto

| Decisión | Motivo |
| --- | --- |
| Convertir `index.html` en plataforma y conservar la portada anterior como `presentacion.html` | Permitir uso cotidiano sin perder la presentación original |
| Tres recorridos: gerencia, planificación y equipos | Adaptar profundidad sin separar la información |
| Compartir familia, período y selección de equipo | Poder pasar de un indicador a su contexto y luego a una acción |
| Usar costos existentes y marcar simulación | Evitar dar apariencia de telemetría o gestión productiva conectada |
| No inventar presupuestos, ahorros, MTBF, MTTR, estados de falla ni metas aprobadas | No existen insumos suficientes |
| Priorización por referencia de disponibilidad demo, luego costo | Criterio explícito, modificable y verificable; no predicción |
| Acciones guardadas localmente con exportación/importación | Primera funcionalidad utilizable sin introducir un backend ficticio |
| 3D bajo demanda, con imagen alternativa | Conservar rapidez y accesibilidad del análisis |
| Mantener modelos ilustrativos separados de los ratios | El estado del videojuego no es evidencia de la operación |
| Documentación versionada en Git | Continuidad independiente de una IA concreta |

## 4. Implementado en v0.2.0

### Resumen ejecutivo

- Costo de familias, costo/hora sobre muestra detallada, disponibilidad media demo y cobertura de costo.
- Distribución horizontal por familia, selección directa y filtro global.
- Entradas al equipo de mayor costo, disponibilidad bajo referencia y plan de acciones.
- Exportación del resumen filtrado como CSV, con alcance y origen por indicador.

### Planificación

- Tabla de los 48 equipos disponibles, búsqueda por equipo/modelo/sistema y filtros de revisión.
- Referencia de disponibilidad ajustable, inicialmente 90%; se identifica como exploratoria.
- Orden: equipos bajo referencia por menor disponibilidad; luego restantes por mayor costo. Empates se resuelven con código de equipo.
- Formulario de acción con responsable, fecha objetivo y texto; estados Pendiente / En curso / Cerrada.
- Persistencia local, exportación completa a JSON e importación validada. Identificadores ya existentes conservan la versión local.
- Los textos se escapan para que una nota no se interprete como HTML.

### Equipos y 3D

- Selector de equipo dentro del filtro de familia.
- Costo total, material, servicios, horas y disponibilidad demo.
- Cinco sistemas de mayor costo más resto para conciliar el total.
- OT históricas del extracto; se omiten duplicados exactos únicamente. No se presentan como backlog.
- Los tres modelos de Tajo Norte cargan desde este repositorio, con rotación, zoom, restablecimiento de cámara y animación.
- El camión ilustra acarreo y la pala ilustra carguío. El tractor y las combinaciones que no corresponden se muestran como catálogo no vinculado.
- No hay selección de piezas por costo ni mapa de calor sobre los GLB en esta entrega.

### Conservación y continuidad

- La presentación original y sus siete capítulos siguen disponibles; se añadió un enlace de regreso a la plataforma.
- El objeto `DATA` original se extrajo sin cambiar sus valores a `assets/data/cierre-2026-08.json`.
- Código modular, dependencias fijadas, lockfile, build, pruebas y documentación incluidos.
- Se preserva el crédito a Joaquin Zavaleta y la identidad San Martín.

## 5. Datos que no deben confundirse

- Total por familias: **S/ 8,036,594**.
- Detalle: **48 equipos, S/ 5,784,790**, aproximadamente 72.0% del costo.
- Maestro: **1,124 equipos**. No representa flota activa ni disponibilidad.
- Horas: **21,604**, simuladas; disponibilidad: simulada.
- El costo por fases no concilia con el total por familias; no se usa para construir los KPIs nuevos.
- Algunas sumas material + servicios difieren de `tot` hasta en S/ 1, por el redondeo presente en la fuente. Se conserva `tot` como total publicado.
- No hay base de usuarios ni sincronización central. Una acción creada en una laptop no aparece automáticamente en otra.

Ver todas las fórmulas y contratos en `DATOS.md`.

## 6. Verificación y publicación

- Build generado sin errores.
- Ocho pruebas de cálculos, cobertura, prioridad, OT e importación aprobadas.
- Recorridos automatizados de navegador aprobados; tres GLB, controles y animación; creación/recarga/estado de acción, exportaciones e importación; alternativa ante fallo del 3D.
- Interfaz revisada a 390, 768 y 1440 px; sin desbordamiento horizontal de la página. Las tablas mantienen scroll dentro de su contenedor.
- Capturas de revisión y resultado resumido en `docs/VALIDACION.md`.
- **Publicado y verificado** en `https://fernlox753.github.io/torre-control-flota/`. Primera entrega de plataforma: commit `fd5dd62`, subido a `main`.
- Se confirmó respuesta HTTP 200 y coincidencia SHA-256 de `index.html`, los bundles y esta memoria entre el servidor público y los archivos locales; se abrió la ficha FC-104 y cargó su camión 3D en el navegador público.
- Ajuste de cierre: el enlace «Saltar al contenido» mueve el foco al panel actual y no cambia el recorrido elegido. Incluye prueba de regresión.
- Los commits posteriores de cierre registran la publicación y ajustes verificados; consultar `git log` para el último hash. La presentación original continúa disponible.

## 7. Siguiente iteración propuesta

1. Validar con el usuario qué ratios necesitan gerencia y planners en su operación, sus definiciones y metas aprobadas.
2. Recibir una fuente estructurada real: costos, horómetros, horas programadas, paradas, OT, equipos, materiales y presupuesto. Acordar claves y reglas de conciliación.
3. Preparar servicio de datos y persistencia compartida con usuarios, permisos y bitácora de cambios. La navegación actual por vistas no resuelve seguridad.
4. Añadir backlog real, cumplimiento de programación, MTBF y MTTR solo cuando existan eventos y denominadores correctos.
5. Profundizar causas: sistema → OT → material/proveedor. Los capítulos anteriores ya contienen ejemplos, pero aún no se integraron en el nuevo flujo.
6. Definir un mapa explícito de piezas GLB a sistemas, antes de aplicar costos o colores al modelo. Los motores comerciales y el MH145 no son equivalentes pieza por pieza.
7. Evaluar vista de mina con selección de equipos si aporta ubicación o contexto operativo. No copiar la física del juego al cálculo de indicadores.

## 8. Cómo retomar

Leer esta memoria, revisar `git status`, revisar últimos commits y ejecutar los comandos del README. No rehacer la implementación por falta del chat previo. Antes de cambiar una fórmula, revisar sus denominadores y cobertura. Al terminar, registrar cambios y pendientes aquí y en `CHANGELOG.md`, reconstruir y probar los recorridos afectados.

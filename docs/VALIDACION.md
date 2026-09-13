# Validación de v0.2.0

Fecha: 13 de septiembre de 2026. Entorno: Windows, Node.js, Chrome con Playwright. Datos del cierre de agosto de 2026.

## Resultado

- `pnpm install --frozen-lockfile`: instalación reproducible completada.
- `pnpm build`: bundles generados.
- `pnpm test`: **8 pruebas aprobadas**.
- `pnpm test:ui`: **recorridos aprobados**, sin errores JavaScript ni peticiones fallidas inesperadas.

## Cobertura de pruebas

1. Total por familias vs. costo detallado, cantidad de equipos y cobertura.
2. Familia sin equipos detallados: costo conservado y ratios sin datos.
3. Costo/hora como ratio de sumas y disponibilidad como promedio simple explícito.
4. Priorización con referencia estricta y orden determinista.
5. Conciliación de sistemas y señalización de exceso de desglose.
6. Eliminación de duplicados exactos de OT, conservando líneas distintas.
7. Validación completa de importación: fecha, equipo, esquema, estados e IDs.
8. Reimportación sin duplicar ni sobrescribir el trabajo local.
9. Navegación entre vistas y contexto de familia/equipo.
10. Carga de camión, pala y tractor; controles de cámara y activación/pausa de animaciones.
11. Formulario de acción, guardado y recarga; cambio de estado persistente.
12. Texto con etiquetas HTML tratado como texto, sin ejecución.
13. Exportación JSON y CSV, e importación idempotente.
14. Búsqueda sin resultados y modificación de referencia.
15. Pantallas de 390, 768 y 1440 px sin desbordamiento horizontal de la página.
16. Respuesta 503 simulada al cargar GLB: imagen alternativa, reintento y costos conservados.

## Revisión visual

Se inspeccionaron capturas del resumen, las fichas 3D y la versión móvil. Se amplió el modelo y se ajustaron el tamaño de texto y la composición visual tras la primera revisión.

- [Resumen ejecutivo](images/resumen-ejecutivo.png)
- [Ficha con camión 3D](images/ficha-equipo.png)
- [Resultado automatizado de navegador](validation-result.json)

También se comparó el JSON extraído con el objeto original y los datos de los ocho capítulos; sus valores son idénticos. Los tres GLB coinciden por SHA-256 con los archivos de Tajo Norte.

Las capturas de escritorio de los tests incluyen todos los contenidos de la página. La barra lateral es fija durante la navegación. Las tablas se desplazan dentro de su contenedor en pantallas estrechas.

## No validado como operación productiva

No se ha certificado compatibilidad con todos los navegadores, dispositivos de baja potencia, lectores de pantalla ni carga multiusuario. No se han validado datos contra SAP u otra fuente primaria. No hay pruebas de integración con ERP/CMMS porque no existe esa conexión. La ejecución automática de animaciones confirma funcionamiento de controles, no exactitud mecánica certificada de los equipos.

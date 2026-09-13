# Datos, cobertura y fórmulas

## Fuente preservada

`assets/data/cierre-2026-08.json` contiene el objeto `DATA` de `index.html` del commit original `b21d51e`. No se modificaron importes, porcentajes, horas, identificadores ni descripciones. No existe integración de lectura o escritura a SAP. El repositorio original es la fuente disponible, no los documentos fuente que pudieran haberlo originado.

| Campo | Uso | Alcance |
| --- | --- | --- |
| `gen` | Período `ago-2026` | Único período disponible |
| `familias[].n / tot / eq` | Familia, costo y equipos del maestro | 7 familias; S/ 8,036,594; 1,124 equipos |
| `equipos[]` | Muestra detallada | 48 equipos; S/ 5,784,790 |
| `equipos[].mat / srv / tot` | Material, servicio y total del cierre | Conservar total informado; redondeos hasta S/ 1 |
| `equipos[].hrs / disp` | Horas y disponibilidad | Simuladas en el proyecto original |
| `equipos[].cph` | Ratio guardado en la fuente | La plataforma lo recalcula desde `tot / hrs` |
| `equipos[].sys` | Costo por sistema | Desglose parcial; el resto se hace explícito |
| `equipos[].ots` | Extracto de OT históricas | No incluye estado actual, cierre ni duración |
| `fases / articulos / prov / sysdesc` | Datos del relato original | Conservados; no todos usados por la plataforma nueva |

El total de `fases[].v` es S/ 6,873,415 y **no concilia** con el total por familias. No se mezclan esas bases en un mismo KPI. Tampoco se deben sumar costos de OT al costo de equipo: serían bases potencialmente superpuestas.

## Fórmulas

Para el filtro de familia seleccionado:

- **Costo de mantenimiento:** suma de `familias[].tot`.
- **Costo detallado:** suma de `equipos[].tot`.
- **Costo por hora:** suma del costo detallado / suma de horas de esos mismos equipos. No es promedio simple de ratios individuales.
- **Disponibilidad media:** promedio simple de `disp` de equipos detallados. No es disponibilidad ponderada de flota, porque no existen denominadores horarios fiables.
- **Cobertura del detalle:** costo detallado / costo de familias × 100. No es porcentaje de equipos del maestro.
- **Concentración:** costo de una familia / costo de familias seleccionadas × 100; en una sola familia, naturalmente 100%.
- **Costo de sistema:** se divide entre `tot` del equipo. La vista muestra cinco sistemas principales y un renglón con el resto. Si el desglose completo supera el total, debe mostrarse la discrepancia y conciliar la fuente.

Cuando no hay equipos detallados, se conserva el total de la familia, cobertura 0% y ratios sin datos (`—`). No convertir ausencia de datos en disponibilidad 0% o costo/hora 0.

## Priorización

Referencia inicial: 90%, ajustable entre 0 y 100. No es una meta de San Martín aprobada por el usuario. Un equipo con `disp < referencia` aparece primero; entre ellos se ordena por menor disponibilidad. Los demás se ordenan por mayor costo. Un costo alto **no confirma una falla**, y la disponibilidad demo no debe disparar una intervención automática.

La propuesta inicial de acción pide contrastar antecedentes. No declara causa raíz ni predice averías.

## Acciones locales

Clave: `torre-control:actions:v1` en `localStorage` del origen web.

```json
{
  "schemaVersion": 1,
  "actions": [
    {
      "id": "UUID",
      "equipment": "FC-104",
      "owner": "Responsable",
      "due": "2026-09-20",
      "note": "Revisar antecedentes antes de preparar la intervención.",
      "status": "Pendiente"
    }
  ]
}
```

Validar antes de guardar: versión de esquema, máximo 500 acciones, ID único, equipo existente, fecha calendario válida, responsable no vacío de hasta 100 caracteres, nota de hasta 1,000 caracteres y estado permitido. La importación admite hasta 1 MB y rechaza todo el archivo si un registro es inválido. Se añaden ID nuevos y se conserva el registro local ante duplicados; esto **no es una sincronización con resolución de conflictos**.

No almacenar secretos ni información sensible en notas de esta demostración. El historial compartido, usuarios, autorizaciones y auditoría requieren un backend. Las ventanas del mismo navegador reciben eventos de almacenamiento, pero no hay transacciones entre usuarios ni garantía de concurrencia distribuida.

## Para una integración real

Se necesitan fuentes y claves estables para equipo, sede, período, moneda, OT, sistema, artículo, proveedor y centro de costo. Los indicadores de confiabilidad requieren eventos con inicio/fin y reglas de exclusión. Disponibilidad exige horas programadas y paradas conciliadas. Presupuesto y metas deben tener versión, período, alcance y aprobación. Acordar primero esos contratos y después implementar los ratios.

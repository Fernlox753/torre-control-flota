export const FAMILY_NAMES = {
  ACARREO: "Acarreo",
  CARGUIO: "Carguío",
  "CARGUIO MENOR": "Carguío menor",
  PERFO: "Perforación",
  "ACARREO MENOR": "Acarreo menor",
  "AUX.OP": "Auxiliares de operación",
  "AUX.TALLER": "Auxiliares de taller",
};
export const familyName = (key) => FAMILY_NAMES[key] || key;
export const sum = (rows, key) =>
  rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);
export function scope(data, family = "all") {
  const families = data.familias.filter(
    (f) => family === "all" || f.n === family,
  );
  const equipment = data.equipos.filter(
    (e) => family === "all" || e.fam === family,
  );
  const cost = sum(families, "tot"),
    detailCost = sum(equipment, "tot"),
    hours = sum(equipment, "hrs");
  return {
    families,
    equipment,
    cost,
    detailCost,
    hours,
    master: sum(families, "eq"),
    coverage: cost > 0 ? (detailCost / cost) * 100 : null,
    cph: hours > 0 ? detailCost / hours : null,
    // No denominadores temporales de disponibilidad: promedio simple, no disponibilidad de flota.
    availability: equipment.length
      ? sum(equipment, "disp") / equipment.length
      : null,
  };
}
export function priorities(equipment, threshold = 90) {
  return [...equipment]
    .map((e) => ({
      ...e,
      belowTarget: e.disp < threshold,
      reason:
        e.disp < threshold
          ? "Revisar disponibilidad"
          : "Revisar concentración de costo",
    }))
    .sort(
      (a, b) =>
        Number(b.belowTarget) - Number(a.belowTarget) ||
        (a.belowTarget ? a.disp - b.disp : b.tot - a.tot) ||
        a.id.localeCompare(b.id),
    );
}
export function systemRows(equipment) {
  const rows = [...equipment.sys].sort((a, b) => b.v - a.v);
  const remainder = equipment.tot - sum(rows, "v");
  if (remainder > 0)
    rows.push({ c: "OTHER", n: "Otros sistemas / sin desglose", v: remainder });
  return { rows, discrepancy: remainder < 0 ? -remainder : 0 };
}
export function uniqueOrders(equipment) {
  const seen = new Set();
  return equipment.ots.filter((o) => {
    const k = JSON.stringify(o);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
export function validateActions(value, equipmentIds) {
  if (
    !value ||
    value.schemaVersion !== 1 ||
    !Array.isArray(value.actions) ||
    value.actions.length > 500
  )
    throw new Error(
      "El archivo debe ser una exportación de acciones de esta plataforma (máximo 500).",
    );
  const seen = new Set();
  for (const a of value.actions) {
    const validDate =
      typeof a?.due === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(a.due) &&
      !Number.isNaN(Date.parse(a.due)) &&
      new Date(a.due).toISOString().slice(0, 10) === a.due;
    if (
      !a ||
      typeof a.id !== "string" ||
      a.id.length > 80 ||
      seen.has(a.id) ||
      !equipmentIds.includes(a.equipment) ||
      !["Pendiente", "En curso", "Cerrada"].includes(a.status) ||
      typeof a.owner !== "string" ||
      !a.owner.trim() ||
      a.owner.length > 100 ||
      typeof a.note !== "string" ||
      !a.note.trim() ||
      a.note.length > 1000 ||
      !validDate
    )
      throw new Error(
        "Hay acciones incompletas, duplicadas o equipos desconocidos. No se importó ningún cambio.",
      );
    seen.add(a.id);
  }
  return value.actions.map(({ id, equipment, owner, due, note, status }) => ({
    id,
    equipment,
    owner,
    due,
    note,
    status,
  }));
}
export function mergeActions(current, imported) {
  // Conserva las acciones locales al volver a importar el mismo identificador.
  const byId = new Map(current.map((a) => [a.id, a]));
  imported.forEach((a) => {
    if (!byId.has(a.id)) byId.set(a.id, a);
  });
  if (byId.size > 500)
    throw new Error("El total supera el límite de 500 acciones.");
  return [...byId.values()];
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  scope,
  priorities,
  systemRows,
  uniqueOrders,
  validateActions,
  mergeActions,
} from "../src/analytics.js";
const data = JSON.parse(
  readFileSync(new URL("../assets/data/cierre-2026-08.json", import.meta.url)),
);
test("El total de familias no se confunde con la muestra detallada", () => {
  const s = scope(data);
  assert.equal(s.cost, 8036594);
  assert.equal(s.detailCost, 5784790);
  assert.equal(s.master, 1124);
  assert.equal(s.equipment.length, 48);
  assert.ok(s.coverage > 71 && s.coverage < 73);
});
test("Una familia sin detalle conserva su costo y deja los ratios sin datos", () => {
  const s = scope(data, "AUX.OP");
  assert.equal(s.cost, 96323);
  assert.equal(s.equipment.length, 0);
  assert.equal(s.cph, null);
  assert.equal(s.availability, null);
  assert.equal(s.coverage, 0);
});
test("Costo por hora divide sumas; disponibilidad es promedio simple explícito", () => {
  const d = {
    familias: [{ n: "A", tot: 300, eq: 2 }],
    equipos: [
      { fam: "A", tot: 100, hrs: 10, disp: 80 },
      { fam: "A", tot: 200, hrs: 40, disp: 90 },
    ],
  };
  const s = scope(d);
  assert.equal(s.cph, 6);
  assert.notEqual(s.cph, 7.5);
  assert.equal(s.availability, 85);
});
test("La prioridad usa umbral estricto, luego disponibilidad, luego costo", () => {
  const p = priorities(
    [
      { id: "A", tot: 10, disp: 80 },
      { id: "B", tot: 30, disp: 90 },
      { id: "C", tot: 20, disp: 79 },
      { id: "D", tot: 100, disp: 90 },
    ],
    90,
  );
  assert.deepEqual(
    p.map((e) => e.id),
    ["C", "A", "D", "B"],
  );
  assert.equal(p[2].belowTarget, false);
});
test("El resto de sistemas reconcilia y excesos se señalan", () => {
  assert.equal(systemRows({ tot: 100, sys: [{ v: 35 }] }).rows[1].v, 65);
  assert.equal(systemRows({ tot: 20, sys: [{ v: 35 }] }).discrepancy, 15);
});
test("OT: elimina duplicados exactos, conserva líneas distintas de la misma orden", () => {
  const a = { ot: "1", cost: 3, txt: "A" },
    b = { ot: "1", cost: 4, txt: "B" };
  assert.deepEqual(uniqueOrders({ ots: [a, { ...a }, b] }), [a, b]);
});
const action = {
  id: "test",
  equipment: "FC-104",
  owner: "Planner",
  due: "2026-09-20",
  note: "Revisar antecedentes",
  status: "Pendiente",
};
test("Importación valida completamente antes de aceptar cambios", () => {
  const ids = ["FC-104"];
  assert.equal(
    validateActions({ schemaVersion: 1, actions: [action] }, ids).length,
    1,
  );
  for (const a of [
    { ...action, equipment: "desconocido" },
    { ...action, due: "2026-02-30" },
    { ...action, owner: " " },
    { ...action, status: "Otra" },
  ])
    assert.throws(() =>
      validateActions({ schemaVersion: 1, actions: [a] }, ids),
    );
  assert.throws(() =>
    validateActions({ schemaVersion: 1, actions: [action, action] }, ids),
  );
});
test("Reimportar no duplica ni pisa cambios locales", () => {
  assert.deepEqual(mergeActions([action], [{ ...action, status: "Cerrada" }]), [
    action,
  ]);
  assert.equal(mergeActions([action], [{ ...action, id: "new" }]).length, 2);
});

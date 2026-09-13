import data from "../assets/data/cierre-2026-08.json";
import {
  familyName,
  sum,
  scope,
  priorities,
  systemRows,
  uniqueOrders,
  validateActions,
  mergeActions,
} from "./analytics.js";

const $ = (id) => document.getElementById(id);
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const num = (n, d = 0) =>
  n == null
    ? "—"
    : n.toLocaleString("es-PE", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      });
const money = (n) => `S/ ${num(n)}`;
const compact = (n) =>
  n >= 1e6 ? `${num(n / 1e6, 2)} MM` : `${num(n / 1000, 1)} mil`;
const pct = (n) => (n == null ? "—" : `${num(n, 1)}%`);
const STORAGE = "torre-control:actions:v1";
const views = {
  gerencia: [
    "GERENCIA / VISIÓN GENERAL",
    "Resumen ejecutivo",
    "Lo esencial para entender el costo y decidir dónde profundizar.",
  ],
  planificacion: [
    "PLANIFICACIÓN / DE LA EVIDENCIA A LA ACCIÓN",
    "Prioridades de mantenimiento",
    "Revisa el contexto del equipo y prepara el siguiente paso.",
  ],
  equipos: [
    "FLOTA / DETALLE DEL EQUIPO",
    "Conoce el equipo. Entiende el costo.",
    "Un mismo contexto para gerencia, planificación y mantenimiento.",
  ],
  metodologia: [
    "PLATAFORMA / FUENTES Y ALCANCE",
    "Información con contexto",
    "Qué conocemos, cómo lo calculamos y qué falta conectar.",
  ],
};
const models = {
  truck: { name: "Camión MH145", clip: "Tolva_subir_bajar" },
  shovel: { name: "Pala PS50FS", clip: "Ciclo_de_carga" },
  dozer: { name: "Tractor TD50", clip: "Ciclo_tractor" },
};
let state = {
  view: "gerencia",
  family: "all",
  equipment: "FC-104",
  search: "",
  filter: "all",
  threshold: 90,
  model: "truck",
};
let actions = [],
  viewer = null,
  viewerEpoch = 0,
  toastTimer,
  storageWarning = "";
try {
  const saved = localStorage.getItem(STORAGE);
  if (saved)
    actions = validateActions(
      JSON.parse(saved),
      data.equipos.map((e) => e.id),
    );
} catch {
  storageWarning =
    "No se pudieron leer las acciones locales. El registro existente no se ha sobrescrito.";
}
function toast(message) {
  $("toast").textContent = message;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("toast").hidden = true), 6500);
}
function saveActions(next) {
  if (storageWarning) {
    toast(
      "El almacenamiento requiere revisión. Exporta o recupera el registro anterior antes de guardar.",
    );
    return false;
  }
  try {
    localStorage.setItem(
      STORAGE,
      JSON.stringify({ schemaVersion: 1, actions: next }),
    );
    actions = next;
    return true;
  } catch {
    toast(
      "No se pudo guardar. Verifica el espacio o los permisos del navegador; no se modificaron las acciones.",
    );
    return false;
  }
}
function download(name, body, type = "application/json") {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const head = (title, description, extra = "") =>
  `<div class="panel-head"><div><h2>${title}</h2><p>${description}</p></div>${extra}</div>`;
const kpi = (label, value, detail, badge = "", main = false) =>
  `<article class="kpi ${main ? "main" : ""}"><div class="label">${label}${badge ? `<small>${badge}</small>` : ""}</div><div class="value">${value}</div><div class="detail">${detail}</div></article>`;
const equipmentButton = (
  id,
  label = "Ver equipo",
  className = "button ghost",
) =>
  `<button class="${className}" data-equipment="${escape(id)}">${label} ↗</button>`;
function actionButton(id, label = "Preparar acción") {
  return `<button class="button primary" data-action="${escape(id)}">＋ ${label}</button>`;
}
const currentScope = () => scope(data, state.family);
function stopViewer() {
  viewerEpoch++;
  viewer?.dispose();
  viewer = null;
}
function ensureEquipment() {
  const eq = currentScope().equipment;
  if (!eq.some((e) => e.id === state.equipment))
    state.equipment = eq[0]?.id || "";
}
function navigate(view, equipment) {
  if (equipment) {
    state.equipment = equipment;
    const e = data.equipos.find((e) => e.id === equipment);
    if (e && state.family !== "all" && state.family !== e.fam)
      state.family = e.fam;
  }
  const params = new URLSearchParams({ familia: state.family });
  if (state.equipment) params.set("equipo", state.equipment);
  const hash = `#${view}?${params}`;
  if (location.hash === hash) render();
  else location.hash = hash;
}
function readRoute() {
  const [view, query] = location.hash.slice(1).split("?");
  state.view = views[view] ? view : "gerencia";
  const params = new URLSearchParams(query);
  if (params.has("familia"))
    state.family = data.familias.some((f) => f.n === params.get("familia"))
      ? params.get("familia")
      : "all";
  if (
    params.has("equipo") &&
    data.equipos.some((e) => e.id === params.get("equipo"))
  )
    state.equipment = params.get("equipo");
  ensureEquipment();
  render();
  window.scrollTo({ top: 0 });
}
function renderExecutive(s) {
  const families = [...s.families].sort((a, b) => b.tot - a.tot),
    top = families[0];
  const maxCost = Math.max(...families.map((f) => f.tot));
  const topEquipment = [...s.equipment].sort((a, b) => b.tot - a.tot)[0];
  const below = s.equipment.filter((e) => e.disp < state.threshold);
  const demoModel =
    state.family === "CARGUIO" || state.family === "CARGUIO MENOR"
      ? "shovel"
      : "truck";
  return `<section class="kpis" aria-label="Indicadores del alcance seleccionado">
    ${kpi("Costo de mantenimiento", `<span class="unit">S/</span> ${compact(s.cost)}`, `${num(s.master)} equipos en el maestro`, "Cierre", true)}
    ${kpi("Costo por hora", s.cph == null ? "—" : `<span class="unit">S/</span> ${num(s.cph)}`, `Sobre ${num(s.hours)} h de ${s.equipment.length} equipos`, "Demo")}
    ${kpi("Disponibilidad media", pct(s.availability), "Promedio simple de equipos con detalle", "Demo")}
    ${kpi("Cobertura del detalle", pct(s.coverage), `${s.equipment.length} equipos · ${money(s.detailCost)}`, "Costo")}
  </section>
  <div class="grid-main"><section class="panel">${head("El costo, en perspectiva.", "Selecciona una familia para enfocar el análisis.", `<span class="micro-badge">S/ · Agosto</span>`)}<div class="panel-body"><div class="cost-chart" aria-label="Costo por familia">
  ${families.map((f) => `<button class="cost-row" data-family="${escape(f.n)}" title="${escape(familyName(f.n))}: ${money(f.tot)}"><span>${familyName(f.n)}</span><span class="track"><span class="bar" style="width:${(f.tot / maxCost) * 100}%"></span></span><span class="amount">${compact(f.tot)}</span></button>`).join("")}
  </div><div class="chart-foot"><span>Familias en el alcance <b>${families.length}</b></span><span>Total <b>${money(s.cost)}</b></span></div>
  <div class="insight"><strong>${familyName(top.n)} concentra ${pct((top.tot / s.cost) * 100)} del costo seleccionado.</strong>Empieza por sus equipos y sistemas de mayor consumo.</div></div></section>
  <section class="panel asset-teaser">${head("La operación tiene otra dimensión.", "Explora los modelos que creamos en Tajo Norte.", '<span class="micro-badge">3D</span>')}
  <img src="assets/images/${demoModel}.png" alt="Modelo ${models[demoModel].name} del videojuego Tajo Norte">
  <div class="asset-caption"><div><strong>${models[demoModel].name}</strong><small>Modelo ilustrativo · Tajo Norte</small></div><button class="button" data-go="equipos">Explorar equipos ↗</button></div></section></div>
  <section class="panel section-space">${head("Dónde poner la atención", "Tres entradas para convertir información en decisiones.")}<div class="decision-list">
  <article class="decision"><span class="step"><i></i>01 / CONCENTRACIÓN</span><h3>${topEquipment ? `${escape(topEquipment.id)} · ${money(topEquipment.tot)}` : "Detalle pendiente"}</h3><p>${topEquipment ? `Mayor costo individual del alcance. ${escape(topEquipment.sys[0]?.n || "Sin sistemas detallados")} encabeza su desglose.` : "Esta familia tiene un total de cierre, pero no tiene equipos detallados."}</p>${topEquipment ? equipmentButton(topEquipment.id) : '<button class="button ghost" data-go="metodologia">Ver cobertura ↗</button>'}</article>
  <article class="decision"><span class="step"><i></i>02 / DISPONIBILIDAD · DEMO</span><h3>${below.length} equipos bajo ${state.threshold}%</h3><p>Referencia de trabajo ajustable. Revisar antecedentes antes de proponer una intervención.</p><button class="button ghost" data-plan-filter="below">Revisar prioridades ↗</button></article>
  <article class="decision"><span class="step"><i></i>03 / PLAN DE TRABAJO</span><h3>${actions.filter((a) => a.status !== "Cerrada" && s.equipment.some((e) => e.id === a.equipment)).length} acciones abiertas</h3><p>Registra responsable, fecha objetivo y próximo paso para los equipos seleccionados.</p><button class="button ghost" data-go="planificacion">Abrir planificación ↗</button></article>
  </div></section><p class="coverage-note">Disponibilidad y horas son simuladas. La cobertura compara costos detallados con el cierre; no representa porcentaje de equipos. <a href="#metodologia">Ver metodología ↗</a></p>`;
}
function plannerRows(s) {
  const search = state.search.trim().toLowerCase();
  return priorities(s.equipment, state.threshold).filter(
    (e) =>
      (state.filter === "all" ||
        (state.filter === "below" ? e.belowTarget : !e.belowTarget)) &&
      `${e.id} ${e.mod} ${familyName(e.fam)} ${e.sys.map((s) => s.n).join(" ")}`
        .toLowerCase()
        .includes(search),
  );
}
function tableMarkup(s) {
  const rows = plannerRows(s);
  return `<div class="table-wrap"><table><thead><tr><th>Equipo / modelo</th><th>Foco de revisión</th><th class="number">Costo S/</th><th class="number">S/ h · Demo</th><th class="number">Disp. · Demo</th><th>Sistema de mayor costo</th><th>Siguiente paso</th></tr></thead><tbody>
 ${rows.map((e) => `<tr><td><button class="row-equipment" data-equipment="${escape(e.id)}">${escape(e.id)}</button><small>${escape(e.mod)} · ${familyName(e.fam)}</small></td><td><span class="status ${e.belowTarget ? "attention" : "review"}">${e.belowTarget ? "Disponibilidad" : "Costo"}</span></td><td class="number">${num(e.tot)}</td><td class="number">${num(e.tot / e.hrs)}</td><td class="number">${pct(e.disp)}</td><td>${escape(e.sys[0]?.n || "Sin desglose")}<small>${e.sys[0] ? money(e.sys[0].v) : "—"}</small></td><td><div class="row-actions">${equipmentButton(e.id, "Ficha", "tiny-button")}<button class="tiny-button" data-action="${escape(e.id)}">＋ Acción</button></div></td></tr>`).join("")}
 </tbody></table>${rows.length ? "" : `<div class="empty"><strong>No hay equipos para esta selección</strong>${s.equipment.length ? "Prueba otra búsqueda o foco de revisión." : "El cierre de esta familia no incluye detalle individual."}</div>`}</div><div class="table-foot"><span>${rows.length} de ${s.equipment.length} equipos con detalle</span><span>Primero: menor disponibilidad demo. Después: mayor costo.</span></div>`;
}
function actionsMarkup(s) {
  const visible = actions.filter((a) =>
    s.equipment.some((e) => e.id === a.equipment),
  );
  return visible.length
    ? `<div class="action-list">${visible.map((a) => `<article class="action-item"><span class="status ${a.status === "Cerrada" ? "ok" : "review"}">${escape(a.equipment)}</span><div class="action-text"><h3>${escape(a.owner)}</h3><small>Fecha objetivo: ${escape(a.due.split("-").reverse().join("/"))}</small><p>${escape(a.note)}</p></div><select data-action-status="${escape(a.id)}" aria-label="Estado de la acción de ${escape(a.equipment)}">${["Pendiente", "En curso", "Cerrada"].map((status) => `<option ${status === a.status ? "selected" : ""}>${status}</option>`).join("")}</select></article>`).join("")}</div>`
    : `<div class="empty"><strong>El siguiente paso empieza aquí.</strong>Usa «＋ Acción» en un equipo para preparar una intervención con responsable y fecha.</div>`;
}
function renderPlanner(s) {
  const below = s.equipment.filter((e) => e.disp < state.threshold).length;
  return `<section class="planner-summary"><article class="mini-stat"><b>${below}</b><span>Por revisar<small>Disponibilidad demo &lt; ${state.threshold}%</small></span></article><article class="mini-stat"><b>${s.equipment.length}</b><span>Equipos analizables<small>Detalle del cierre seleccionado</small></span></article><article class="mini-stat"><b>${actions.filter((a) => a.status !== "Cerrada" && s.equipment.some((e) => e.id === a.equipment)).length}</b><span>Acciones abiertas<small>Guardadas en este navegador</small></span></article></section>
 <section class="panel">${head("Una cola de trabajo con contexto.", "El costo identifica dónde investigar; no confirma una falla.", '<span class="micro-badge">PRIORIZACIÓN EXPLICABLE</span>')}
 <div class="toolbar"><label class="search"><input id="search" type="search" placeholder="Buscar equipo, modelo o sistema…" aria-label="Buscar equipo, modelo o sistema" value="${escape(state.search)}"></label><select id="focus-filter" aria-label="Foco de revisión"><option value="all" ${state.filter === "all" ? "selected" : ""}>Todos los focos</option><option value="below" ${state.filter === "below" ? "selected" : ""}>Disponibilidad bajo referencia</option><option value="cost" ${state.filter === "cost" ? "selected" : ""}>Revisión por costo</option></select><label>Referencia demo %<input id="threshold" type="number" min="0" max="100" step="1" value="${state.threshold}"></label></div><div id="equipment-table">${tableMarkup(s)}</div></section>
 <p class="coverage-note">La referencia de ${state.threshold}% es exploratoria, no una meta aprobada. No hay estados de falla, backlog real, MTBF ni MTTR disponibles.</p>
 <section class="panel section-space" id="work-plan">${head("Plan de acciones", "Registro local · el filtro de familia también se aplica a las acciones.", `<div class="flex-buttons"><button class="button secondary" id="import-actions">↑ Importar</button><button class="button secondary" id="export-actions">↓ Exportar todas</button></div>`)}${storageWarning ? `<div class="insight">${escape(storageWarning)}</div>` : ""}<div id="actions-list">${actionsMarkup(s)}</div></section>`;
}
function modelNote(e) {
  const matching =
    (state.model === "truck" && e.fam === "ACARREO") ||
    (state.model === "shovel" && e.fam === "CARGUIO");
  return `${models[state.model].name} · Modelo original de Tajo Norte. ${matching ? "Ilustra la familia; no es una réplica certificada del " + e.mod + "." : "Vista de catálogo; este modelo no está vinculado al equipo " + e.id + "."} Las animaciones no representan su estado operativo.`;
}
function renderEquipment(s) {
  const e = s.equipment.find((e) => e.id === state.equipment);
  if (!e)
    return `<section class="panel empty"><strong>No hay equipos detallados para esta familia.</strong>Selecciona otra familia para consultar una ficha y el catálogo 3D.</section>`;
  const systems = systemRows(e),
    orders = uniqueOrders(e),
    known = systems.rows.filter((r) => r.c !== "OTHER"),
    top = known[0];
  const displayed = known.slice(0, 5),
    rest = e.tot - sum(displayed, "v");
  if (rest > 0) displayed.push({ n: "Otros sistemas / sin desglose", v: rest });
  return `<div class="equipment-header"><div class="equipment-select"><select id="equipment-select" aria-label="Equipo seleccionado">${s.equipment.map((eq) => `<option value="${escape(eq.id)}" ${eq.id === e.id ? "selected" : ""}>${escape(eq.id)} · ${escape(eq.mod)} · ${familyName(eq.fam)}</option>`).join("")}</select><small>${escape(e.cond)} · ${escape(e.marca)}</small></div>${actionButton(e.id)}</div>
 <div class="equipment-grid"><section class="panel viewer-panel"><div class="model-tabs" role="group" aria-label="Catálogo de modelos de Tajo Norte">${Object.entries(
   models,
 )
   .map(
     ([key, m]) =>
       `<button data-model="${key}" aria-pressed="${state.model === key}">${m.name}</button>`,
   )
   .join("")}</div>
 <div class="stage" id="stage"><img src="assets/images/${state.model}.png" alt="${models[state.model].name}, modelo ilustrativo" id="model-poster"><button class="button primary viewer-load" id="load-3d">◈ Activar modelo 3D</button><div class="viewer-message" id="viewer-message" role="status" hidden></div></div>
 <div class="viewer-tools" id="viewer-tools" hidden><button id="rotate-left" aria-label="Girar modelo a la izquierda">↶ Girar</button><button id="rotate-right" aria-label="Girar modelo a la derecha">Girar ↷</button><button id="zoom-in" aria-label="Acercar modelo">＋</button><button id="zoom-out" aria-label="Alejar modelo">−</button><button id="reset-camera">Restablecer</button><button id="animate-model" aria-pressed="false">▷ Ver movimiento</button></div><p class="model-note" id="model-note">${modelNote(e)}</p></section>
 <section class="panel">${head("El costo de " + escape(e.id), "Cierre individual · Agosto 2026", '<span class="micro-badge">S/</span>')}<div class="detail-metrics"><div><small>Mantenimiento total</small><b>${money(e.tot)}</b></div><div><small>S/ hora · Demo</small><b>${num(e.tot / e.hrs)}</b></div><div><small>Materiales</small><b>${money(e.mat)}</b></div><div><small>Servicios</small><b>${money(e.srv)}</b></div></div><p class="breakdown-note">${pct(e.disp)} disponibilidad demo · ${num(e.hrs)} h simuladas.<br>Principales sistemas y resto del costo:</p><div class="system-list">${displayed.map((r) => `<div class="system-row"><div><span>${escape(r.n)}</span><b>${money(r.v)}</b></div><div class="track"><i class="bar" style="width:${Math.min(100, (r.v / e.tot) * 100)}%"></i></div></div>`).join("")}</div>${systems.discrepancy ? `<p class="breakdown-note">Advertencia: el desglose supera el total en ${money(systems.discrepancy)}. Requiere conciliación.</p>` : ""}</section></div>
 <section class="detail-insight"><div><h3>Una hipótesis para investigar</h3><p>${top ? `${escape(top.n)} representa ${pct((top.v / e.tot) * 100)} del costo del equipo. Contrasta las OT, consumos y antecedentes antes de definir el trabajo.` : "Solicita el desglose de sistemas antes de definir una intervención."}</p></div>${actionButton(e.id, "Llevar al plan")}</section>
 <section class="panel section-space">${head("Antecedentes de órdenes de trabajo", "Extracto histórico del cierre. No informa estado actual ni trabajo pendiente.", `<span class="micro-badge">${orders.length} registros únicos</span>`)}${orders.length ? `<div class="table-wrap"><table><thead><tr><th>Orden</th><th>Fecha · 2026</th><th>Clase</th><th>Descripción</th><th>Sistema</th><th class="number">Costo registrado S/</th></tr></thead><tbody>${orders.map((o) => `<tr><td>${escape(o.ot)}</td><td>${escape(o.d)}</td><td>${escape(o.cls)}</td><td>${escape(o.txt)}</td><td>${escape(o.sis)}</td><td class="number">${num(o.cost)}</td></tr>`).join("")}</tbody></table></div>` : '<div class="empty">Este equipo no tiene OT en el extracto. No implica ausencia de mantenimiento.</div>'}<div class="table-foot"><span>${e.ots.length - orders.length} duplicados exactos omitidos en esta vista.</span><span>Las OT no concilian necesariamente el costo completo.</span></div></section>`;
}
function renderMethodology() {
  return `<div class="methodology"><section class="panel prose"><h2>Un cierre, dos niveles de cobertura.</h2><p>Fuente: datos incluidos en el repositorio original, cierre de agosto de 2026. <strong>No hay una consulta en vivo a SAP ni una validación independiente de los archivos originales.</strong></p><ul><li><strong>S/ 8,036,594</strong>: total de siete familias.</li><li><strong>1,124 equipos</strong>: maestro; no equivale a equipos operativos.</li><li><strong>48 equipos / S/ 5,784,790</strong>: detalle individual disponible.</li><li>Horas y disponibilidad: <strong>simuladas en el proyecto original</strong>.</li></ul><p><a href="assets/data/cierre-2026-08.json" download>Descargar datos de origen ↗</a> · <a href="presentacion.html">Presentación original ↗</a></p></section>
 <section class="panel prose"><h2>Ratios que puedes interpretar.</h2><ul><li><strong>Costo por hora:</strong> suma del costo de equipos detallados / suma de sus horas simuladas. No es promedio de ratios individuales.</li><li><strong>Disponibilidad media:</strong> promedio simple de porcentajes simulados. Faltan horas programadas y de parada para una disponibilidad ponderada de flota.</li><li><strong>Cobertura:</strong> costo de equipos detallados / costo de familias seleccionadas.</li><li><strong>Prioridad:</strong> primero disponibilidad demo bajo la referencia, de menor a mayor; después costo, de mayor a menor. No es un diagnóstico.</li></ul><p>Sin presupuesto ni metas aprobadas no calculamos desviaciones, cumplimiento o ahorro. MTBF y MTTR requieren eventos e intervalos reales.</p></section>
 <section class="panel prose"><h2>Del análisis al plan.</h2><p>Las vistas son recorridos para distintas necesidades, no roles de seguridad. Gerencia, planners y mantenimiento comparten filtros y equipo.</p><p>Las acciones se almacenan en <strong>este navegador</strong>. La exportación contiene todas las acciones; la importación añade identificadores nuevos y conserva las versiones locales si ya existen. Compartir requiere enviar el archivo por un medio que tú elijas.</p><p>Para operación multiusuario faltan autenticación, permisos, base de datos, trazabilidad de cambios, estados de OT y conexión a ERP/CMMS.</p></section>
 <section class="panel prose"><h2>Modelos con un propósito.</h2><p>Camión MH145, pala PS50FS y tractor TD50 reutilizados de <a href="https://fernlox753.github.io/tajo-norte/" target="_blank" rel="noopener">Tajo Norte</a>, creado por Joaquin Zavaleta. Son modelos ilustrativos; no representan el estado real ni una réplica certificada de los modelos comerciales del cierre.</p><p>El 3D se carga al solicitarlo y conserva una imagen alternativa. Las animaciones muestran mecanismos; no alimentan indicadores financieros ni disponibilidad.</p><p><a href="docs/MEMORIA.md">Memoria de trabajo ↗</a> · <a href="docs/DATOS.md">Contrato de datos ↗</a> · <a href="https://github.com/Fernlox753/torre-control-flota">Repositorio ↗</a></p></section></div>`;
}
function render() {
  stopViewer();
  ensureEquipment();
  $("family").value = state.family;
  const [eyebrow, title, description] = views[state.view];
  $("page-eyebrow").textContent = eyebrow;
  $("page-title").textContent = title;
  $("page-description").textContent = description;
  document.title = `${title} · Torre de Control`;
  document.querySelectorAll("[data-view]").forEach((a) => {
    if (a.dataset.view === state.view) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  $("nav-actions").textContent = actions.filter(
    (a) => a.status !== "Cerrada",
  ).length;
  const s = currentScope();
  if (state.view === "equipos") {
    const e = s.equipment.find((e) => e.id === state.equipment);
    state.model = e?.fam === "CARGUIO" ? "shovel" : "truck";
  }
  $("content").innerHTML =
    state.view === "gerencia"
      ? renderExecutive(s)
      : state.view === "planificacion"
        ? renderPlanner(s)
        : state.view === "equipos"
          ? renderEquipment(s)
          : renderMethodology();
}
function showAction(id) {
  const e = data.equipos.find((e) => e.id === id);
  if (!e) return;
  const form = $("action-form");
  form.reset();
  form.elements.equipment.value = e.id;
  form.elements.due.value = new Date().toLocaleDateString("en-CA");
  form.elements.note.value = `Revisar ${e.sys[0]?.n || "el desglose de sistemas"} de ${e.id}; contrastar OT y consumos, confirmar causa y proponer intervención.`;
  $("action-context").textContent =
    `${e.id} · ${e.mod} · ${money(e.tot)} en el cierre de agosto.`;
  $("action-dialog").showModal();
}
async function load3D() {
  const epoch = ++viewerEpoch,
    stage = $("stage"),
    button = $("load-3d"),
    message = $("viewer-message");
  if (!stage || !button) return;
  button.disabled = true;
  button.textContent = "Cargando modelo…";
  message.hidden = true;
  try {
    const { createViewer } = await import("./viewer.js");
    if (epoch !== viewerEpoch) return;
    const candidate = await createViewer(
      stage,
      `assets/models/${state.model}.glb`,
      models[state.model].clip,
    );
    if (epoch !== viewerEpoch) {
      candidate.dispose();
      return;
    }
    viewer = candidate;
    $("model-poster").hidden = true;
    button.hidden = true;
    $("viewer-tools").hidden = false;
  } catch (error) {
    if (epoch !== viewerEpoch) return;
    button.disabled = false;
    button.textContent = "Reintentar 3D";
    message.textContent =
      "El 3D no está disponible. Puedes seguir usando la imagen y los datos del equipo.";
    message.hidden = false;
  }
}
document.addEventListener("click", (event) => {
  const target = event.target.closest("button,a");
  if (!target) return;
  if (target.classList.contains("skip")) {
    event.preventDefault();
    $("main").focus();
    return;
  }
  if (target.dataset.view) {
    event.preventDefault();
    navigate(target.dataset.view);
  } else if (target.dataset.go) navigate(target.dataset.go);
  else if (target.dataset.equipment)
    navigate("equipos", target.dataset.equipment);
  else if (target.dataset.action) showAction(target.dataset.action);
  else if (target.dataset.family) {
    state.family = target.dataset.family;
    ensureEquipment();
    navigate(state.view);
  } else if (target.dataset.planFilter) {
    state.filter = target.dataset.planFilter;
    state.search = "";
    navigate("planificacion");
  } else if (target.dataset.model) {
    stopViewer();
    state.model = target.dataset.model;
    document
      .querySelectorAll("[data-model]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", b.dataset.model === state.model),
      );
    $("stage").innerHTML =
      `<img src="assets/images/${state.model}.png" alt="${models[state.model].name}, modelo ilustrativo" id="model-poster"><button class="button primary viewer-load" id="load-3d">◈ Activar modelo 3D</button><div class="viewer-message" id="viewer-message" role="status" hidden></div>`;
    $("viewer-tools").hidden = true;
    $("animate-model").textContent = "▷ Ver movimiento";
    $("animate-model").setAttribute("aria-pressed", "false");
    $("model-note").textContent = modelNote(
      data.equipos.find((e) => e.id === state.equipment),
    );
  } else if (target.id === "load-3d") load3D();
  else if (target.id === "rotate-left") viewer?.rotate(-0.3);
  else if (target.id === "rotate-right") viewer?.rotate(0.3);
  else if (target.id === "zoom-in") viewer?.zoom(0.85);
  else if (target.id === "zoom-out") viewer?.zoom(1.18);
  else if (target.id === "reset-camera") viewer?.reset();
  else if (target.id === "animate-model") {
    const playing = viewer?.toggleAnimation();
    target.textContent = playing ? "Ⅱ Pausar movimiento" : "▷ Ver movimiento";
    target.setAttribute("aria-pressed", Boolean(playing));
  } else if (target.id === "close-dialog") $("action-dialog").close();
  else if (target.id === "export-actions")
    download(
      "acciones-flota.json",
      JSON.stringify(
        {
          schemaVersion: 1,
          period: "2026-08",
          exportedAt: new Date().toISOString(),
          actions,
        },
        null,
        2,
      ),
    );
  else if (target.id === "import-actions") $("import-file").click();
  else if (target.id === "export-summary") {
    const s = currentScope();
    const rows = [
      ["Indicador", "Valor", "Alcance / fuente"],
      ["Periodo", "2026-08", "Cierre estático"],
      [
        "Familia",
        state.family === "all" ? "Todas" : familyName(state.family),
        "Filtro actual",
      ],
      ["Costo cierre S/", s.cost, "Familias"],
      ["Costo detallado S/", s.detailCost, "Equipos con detalle"],
      ["Equipos detallados", s.equipment.length, "No equivale a flota activa"],
      ["Equipos maestro", s.master, "Familias"],
      ["Cobertura costo %", s.coverage ?? "", "Detalle / cierre"],
      ["Costo por hora S/", s.cph ?? "", "Horas simuladas"],
      [
        "Disponibilidad media %",
        s.availability ?? "",
        "Promedio simple; simulada",
      ],
    ];
    download(
      "resumen-flota-2026-08.csv",
      "\ufeff" +
        rows
          .map((row) =>
            row
              .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
              .join(";"),
          )
          .join("\r\n"),
      "text/csv;charset=utf-8",
    );
  }
});
document.addEventListener("input", (event) => {
  if (event.target.id === "search") {
    state.search = event.target.value;
    $("equipment-table").innerHTML = tableMarkup(currentScope());
  }
});
document.addEventListener("change", async (event) => {
  const t = event.target;
  if (t.id === "family") {
    state.family = t.value;
    state.search = "";
    ensureEquipment();
    navigate(state.view);
  } else if (t.id === "focus-filter") {
    state.filter = t.value;
    $("equipment-table").innerHTML = tableMarkup(currentScope());
  } else if (t.id === "threshold") {
    const n = t.valueAsNumber;
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      t.value = state.threshold;
      toast("Usa una referencia entre 0 y 100%.");
      return;
    }
    state.threshold = n;
    render();
  } else if (t.id === "equipment-select") navigate("equipos", t.value);
  else if (t.dataset.actionStatus) {
    const next = actions.map((a) =>
      a.id === t.dataset.actionStatus ? { ...a, status: t.value } : a,
    );
    if (saveActions(next)) toast("Estado guardado en este navegador.");
    render();
  } else if (t.id === "import-file") {
    const file = t.files[0];
    if (!file) return;
    try {
      if (file.size > 1_000_000)
        throw new Error("El archivo supera el límite de 1 MB.");
      const imported = validateActions(
        JSON.parse(await file.text()),
        data.equipos.map((e) => e.id),
      );
      const next = mergeActions(actions, imported),
        added = next.length - actions.length;
      if (saveActions(next)) {
        render();
        toast(
          `${added} acciones importadas. Las versiones locales existentes se conservaron.`,
        );
      }
    } catch (error) {
      toast(
        error instanceof SyntaxError
          ? "El archivo no contiene JSON válido. No se modificaron las acciones."
          : error.message,
      );
    } finally {
      t.value = "";
    }
  }
});
$("action-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget,
    values = new FormData(form);
  const action = {
    id: crypto.randomUUID(),
    equipment: values.get("equipment"),
    owner: values.get("owner").trim(),
    due: values.get("due"),
    note: values.get("note").trim(),
    status: "Pendiente",
  };
  try {
    validateActions(
      { schemaVersion: 1, actions: [action] },
      data.equipos.map((e) => e.id),
    );
    if (actions.length >= 500)
      throw new Error("Se alcanzó el límite de 500 acciones.");
    if (saveActions([...actions, action])) {
      $("action-dialog").close();
      render();
      toast("Acción guardada. Disponible en Planificación.");
    }
  } catch (error) {
    toast(error.message);
  }
});
data.familias.forEach((f) => {
  const option = document.createElement("option");
  option.value = f.n;
  option.textContent = familyName(f.n);
  $("family").append(option);
});
window.addEventListener("hashchange", readRoute);
window.addEventListener("pagehide", stopViewer);
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE) {
    try {
      actions = event.newValue
        ? validateActions(
            JSON.parse(event.newValue),
            data.equipos.map((e) => e.id),
          )
        : [];
      render();
      toast("Acciones actualizadas desde otra pestaña.");
    } catch {
      toast(
        "Otra pestaña guardó un registro no válido. Recarga para revisarlo.",
      );
    }
  }
});
readRoute();
if (storageWarning) toast(storageWarning);

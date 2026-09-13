const { chromium } = require("playwright");
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http");
const root = path.resolve(__dirname, ".."),
  out = path.join(root, "test-results");
fs.mkdirSync(out, { recursive: true });
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".glb": "model/gltf-binary",
  ".md": "text/plain; charset=utf-8",
};
const server = http.createServer((req, res) => {
  let relative;
  try {
    relative = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
  } catch {
    res.writeHead(400).end();
    return;
  }
  const file = path.resolve(
    root,
    "." + (relative === "/" ? "/index.html" : relative),
  );
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (err, buffer) => {
    if (err) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
    });
    res.end(buffer);
  });
});
(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
  });
  try {
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1050 },
      }),
      errors = [],
      failed = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("requestfailed", (r) => failed.push(r.url()));
    await page.goto(base);
    await page.locator(".kpi").first().waitFor();
    assert.equal(await page.locator(".kpi").count(), 4);
    assert.match(await page.locator(".kpi.main").innerText(), /8.04 MM/);
    assert.equal(
      await page.locator("canvas").count(),
      0,
      "El resumen no debe descargar ni renderizar 3D",
    );
    await page.screenshot({
      path: path.join(out, "gerencia-desktop.png"),
      fullPage: true,
    });
    await page.selectOption("#family", "AUX.OP");
    await page.waitForFunction(() =>
      document.querySelector(".kpi.main")?.textContent.includes("96.3 mil"),
    );
    assert.match(await page.locator(".kpi").nth(1).innerText(), /—/);
    await page.locator('[data-view="equipos"]').click();
    await page
      .getByText("No hay equipos detallados para esta familia.")
      .waitFor();
    await page.selectOption("#family", "all");
    await page.locator("#equipment-select").waitFor();
    await page.selectOption("#equipment-select", "FC-104");
    await page.waitForFunction(
      () => document.querySelector("#equipment-select")?.value === "FC-104",
    );
    for (const model of ["truck", "shovel", "dozer"]) {
      await page.locator(`[data-model="${model}"]`).click();
      await page.locator("#load-3d").click();
      await page.waitForFunction(
        (m) =>
          document.querySelector("#stage")?.dataset.loadedModel === m + ".glb",
        model,
        { timeout: 60000 },
      );
      assert.equal(await page.locator("#stage canvas").count(), 1);
      await page.locator("#animate-model").click();
      assert.equal(
        await page.locator("#animate-model").getAttribute("aria-pressed"),
        "true",
      );
      await page.waitForTimeout(500);
      await page.locator("#animate-model").click();
      await page.locator("#rotate-left").click();
      await page.locator("#zoom-in").click();
      await page.locator("#reset-camera").click();
      await page.screenshot({
        path: path.join(out, `equipo-${model}.png`),
        fullPage: true,
      });
    }
    await page.locator('[data-action="FC-104"]').first().click();
    await page.locator('[name="owner"]').fill("Planner de prueba");
    await page.locator('[name="due"]').fill("2026-09-20");
    await page
      .locator('[name="note"]')
      .fill("Revisar OT <script>window.injected=true</script> y consumo.");
    await page
      .getByRole("button", { name: "Guardar acción", exact: true })
      .click();
    await page.reload();
    await page.locator('[data-view="planificacion"]').click();
    await page.locator(".skip").focus();
    await page.keyboard.press("Enter");
    assert.match(page.url(), /#planificacion/);
    assert.equal(await page.evaluate(() => document.activeElement.id), "main");
    await page.locator("#search").fill("FC-104");
    assert.equal(await page.locator("#equipment-table tbody tr").count(), 1);
    assert.equal(await page.locator("#actions-list .action-item").count(), 1);
    assert.equal(await page.evaluate(() => window.injected), undefined);
    await page.locator("[data-action-status]").selectOption("En curso");
    await page.reload();
    assert.equal(
      await page.locator("[data-action-status]").inputValue(),
      "En curso",
    );
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator("#export-actions").click(),
    ]);
    const file = path.join(out, "acciones-test.json");
    await download.saveAs(file);
    const saved = JSON.parse(fs.readFileSync(file));
    assert.equal(saved.actions.length, 1);
    assert.equal(saved.actions[0].status, "En curso");
    await page.locator("#import-file").setInputFiles(file);
    await page.waitForFunction(() =>
      document
        .querySelector("#toast")
        ?.textContent.includes("0 acciones importadas"),
    );
    assert.equal(await page.locator("#actions-list .action-item").count(), 1);
    await page.locator("#search").fill("no-existe");
    assert.equal(await page.locator("#equipment-table tbody tr").count(), 0);
    await page.locator("#search").fill("");
    await page.locator("#threshold").fill("80");
    await page.locator("#threshold").press("Tab");
    await page.waitForFunction(
      () => document.querySelector("#threshold")?.value === "80",
    );
    await page.selectOption("#focus-filter", "below");
    assert.equal(await page.locator("#equipment-table tbody tr").count(), 0);
    await page.locator("#threshold").fill("90");
    await page.locator("#threshold").press("Tab");
    await page.selectOption("#focus-filter", "all");
    await page.screenshot({
      path: path.join(out, "planificacion-desktop.png"),
      fullPage: true,
    });
    const [csvDownload] = await Promise.all([
      page.waitForEvent("download"),
      page.locator("#export-summary").click(),
    ]);
    await csvDownload.saveAs(path.join(out, "resumen-test.csv"));
    assert.match(
      fs.readFileSync(path.join(out, "resumen-test.csv"), "utf8"),
      /8036594/,
    );
    await page.waitForFunction(() => document.querySelector("#toast").hidden);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const view of [
        "gerencia",
        "planificacion",
        "equipos",
        "metodologia",
      ]) {
        if (view === "metodologia")
          await page.locator(".page-footer a").click();
        else await page.locator(`[data-view="${view}"]`).first().click();
        await page.locator("#content .panel").first().waitFor();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        assert.equal(overflow, false, `${view} desborda a ${width}px`);
        if (width === 390)
          await page.screenshot({
            path: path.join(out, `${view}-mobile.png`),
            fullPage: true,
          });
      }
    }
    // Fallo del recurso 3D: conservar datos y ofrecer reintento.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(base + "/#equipos?equipo=FC-104&familia=all");
    await page.route("**/assets/models/*.glb", (route) =>
      route.fulfill({ status: 503, body: "not available" }),
    );
    await page.locator("#load-3d").click();
    await page.getByRole("button", { name: "Reintentar 3D" }).waitFor();
    assert.equal(await page.locator("#model-poster").isVisible(), true);
    assert.match(await page.locator(".detail-metrics").innerText(), /400,935/);
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    fs.writeFileSync(
      path.join(out, "result.json"),
      JSON.stringify(
        {
          passed: true,
          checks: [
            "totales",
            "cobertura vacía",
            "navegación",
            "3 modelos GLB",
            "animaciones y cámaras",
            "acciones y recarga",
            "escape HTML",
            "exportación CSV/JSON",
            "importación idempotente",
            "búsqueda y referencia",
            "responsive 390/768/1440",
            "fallo 3D con alternativa",
          ],
          errors,
          failed,
        },
        null,
        2,
      ),
    );
    console.log(
      "UI: recorridos, 3 modelos, persistencia, exportaciones y responsive verificados.",
    );
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  server.close();
  process.exitCode = 1;
});

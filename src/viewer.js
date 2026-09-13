import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export async function createViewer(stage, url, clipName) {
  const gltf = await new GLTFLoader().loadAsync(url);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch (error) {
    disposeModel(gltf.scene);
    throw error;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  const scene = new THREE.Scene(),
    model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model),
    size = box.getSize(new THREE.Vector3()),
    center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y += size.y / 2;
  scene.add(model);
  const span = Math.max(size.x, size.z, size.y),
    target = new THREE.Vector3(0, size.y * 0.46, 0);
  const camera = new THREE.PerspectiveCamera(37, 1, 0.05, span * 30);
  const distanceFactor = url.includes("dozer") ? 1.18 : 0.94;
  const home = new THREE.Vector3(
    -span * distanceFactor,
    size.y * 0.85 + span * 0.3,
    span * distanceFactor,
  );
  camera.position.copy(home);
  scene.add(new THREE.HemisphereLight(0xeaf5ff, 0x67737f, 2.8));
  const key = new THREE.DirectionalLight(0xfff2d9, 3.8);
  key.position.set(-10, 20, 12);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd8e9ff, 2);
  fill.position.set(10, 8, -10);
  scene.add(fill);
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(span * 1.35, 80),
    new THREE.MeshStandardMaterial({ color: 0xe3e8eb, roughness: 1 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.025;
  scene.add(floor);
  const grid = new THREE.GridHelper(span * 2.4, 24, 0xc7d2da, 0xd5dee4);
  grid.position.y = -0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  scene.add(grid);
  const canvas = renderer.domElement;
  canvas.setAttribute(
    "aria-label",
    "Vista 3D ilustrativa. Usa los botones para girar y acercar.",
  );
  canvas.setAttribute("role", "img");
  stage.append(canvas);
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.minDistance = span * 0.55;
  controls.maxDistance = span * 4;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.enableDamping = false;
  controls.update();
  const mixer = new THREE.AnimationMixer(model),
    clip =
      gltf.animations.find((c) => c.name === clipName) || gltf.animations[0];
  const action = clip ? mixer.clipAction(clip) : null;
  let disposed = false,
    playing = false,
    frame = 0,
    last = 0;
  function draw() {
    if (!disposed && !document.hidden) renderer.render(scene, camera);
  }
  function resize() {
    if (disposed) return;
    const w = stage.clientWidth,
      h = stage.clientHeight;
    if (w < 1 || h < 1) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    draw();
  }
  function tick(time) {
    if (disposed || !playing || document.hidden) return;
    mixer.update(Math.min((time - last) / 1000, 0.05));
    last = time;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function visibility() {
    cancelAnimationFrame(frame);
    if (playing && !document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    } else draw();
  }
  function contextLost(event) {
    event.preventDefault();
    playing = false;
    cancelAnimationFrame(frame);
    const message = stage.querySelector("#viewer-message");
    if (message) {
      message.textContent =
        "Se perdió el contexto 3D. Cambia de modelo para volver a cargarlo. Los datos siguen disponibles.";
      message.hidden = false;
    }
    const poster = stage.querySelector("img");
    if (poster) poster.hidden = false;
    canvas.hidden = true;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  controls.addEventListener("change", draw);
  document.addEventListener("visibilitychange", visibility);
  canvas.addEventListener("webglcontextlost", contextLost);
  resize();
  stage.dataset.loadedModel = url.split("/").pop();
  return {
    rotate(angle) {
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      draw();
    },
    zoom(factor) {
      const offset = camera.position.clone().sub(controls.target);
      offset.setLength(
        THREE.MathUtils.clamp(
          offset.length() * factor,
          controls.minDistance,
          controls.maxDistance,
        ),
      );
      camera.position.copy(controls.target).add(offset);
      controls.update();
      draw();
    },
    reset() {
      camera.position.copy(home);
      controls.target.copy(target);
      controls.update();
      draw();
    },
    toggleAnimation() {
      if (!action) return false;
      playing = !playing;
      if (playing) {
        action.play();
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else cancelAnimationFrame(frame);
      return playing;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      playing = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", contextLost);
      controls.dispose();
      mixer.stopAllAction();
      mixer.uncacheRoot(model);
      disposeModel(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      delete stage.dataset.loadedModel;
    },
  };
}
function disposeModel(root) {
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set();
  root.traverse((obj) => {
    if (obj.geometry) geometries.add(obj.geometry);
    if (obj.material) {
      for (const material of Array.isArray(obj.material)
        ? obj.material
        : [obj.material]) {
        materials.add(material);
        for (const value of Object.values(material))
          if (value?.isTexture) textures.add(value);
      }
    }
  });
  geometries.forEach((g) => g.dispose());
  materials.forEach((m) => m.dispose());
  textures.forEach((t) => t.dispose());
}

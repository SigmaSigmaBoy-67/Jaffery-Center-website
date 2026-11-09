const run = document.querySelector<HTMLElement>("#threshold-run");
const stage = document.querySelector<HTMLElement>("#threshold-stage");
const scene = document.querySelector<HTMLElement>("#house-scene");

if (run && stage && scene) {
  const svg = scene.querySelector<SVGSVGElement>("svg");
  const camera = svg?.querySelector<SVGGElement>("#scene-camera");
  const distant = svg?.querySelector<SVGGElement>("#mountain-distant");
  const middle = svg?.querySelector<SVGGElement>("#mountain-middle");
  const near = svg?.querySelector<SVGGElement>("#mountain-near");
  const shadow = svg?.querySelector<SVGGElement>("#screen-shadow");
  const controls = [...scene.querySelectorAll<HTMLButtonElement>("[data-scene-time]")];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compactArt = window.matchMedia("(max-width: 680px)");
  let frame = 0;
  let intersecting = true;
  let selectedTime = "day";
  let currentProgress = 0;
  let stopped = false;

  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const selectLight = (time: string) => {
    if (!["dawn", "day", "dusk"].includes(time)) return;
    selectedTime = time;
    scene.dataset.time = time;
    controls.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.sceneTime === time)));
    applyProgress(currentProgress);
    const title = svg?.querySelector("#house-title");
    const description = svg?.querySelector("#house-description");
    if (title) title.textContent = `A house of light — ${time} study`;
    if (description) description.textContent = `A layered architectural threshold in the ${time} light, opening onto the Blue Ridge Mountains.`;
  };
  controls.forEach((button) => button.addEventListener("click", () => selectLight(button.dataset.sceneTime ?? "day")));

  const applyProgress = (progress: number) => {
    currentProgress = progress;
    if (camera) {
      const zoom = 1 + progress * 0.062;
      camera.setAttribute("transform", `translate(${-22 * progress} ${-12 * progress}) translate(1090 500) scale(${zoom}) translate(-1090 -500)`);
    }
    distant?.setAttribute("transform", `translate(0 ${-8 * progress})`);
    middle?.setAttribute("transform", `translate(0 ${-20 * progress})`);
    near?.setAttribute("transform", `translate(0 ${-37 * progress})`);
    const lightOffset = selectedTime === "dawn" ? [112, -12] : selectedTime === "dusk" ? [-114, 20] : [0, 0];
    shadow?.setAttribute("transform", `translate(${lightOffset[0] + 92 * progress} ${lightOffset[1] - 14 * progress})`);
    stage.style.setProperty("--departure", String(progress));
    stage.style.setProperty("--departure-clip", `${Math.min(100, progress * 130)}%`);
    stage.style.setProperty("--departure-shift", `${-36 * progress}px`);
    stage.dataset.scrollProgress = progress.toFixed(3);
  };

  const update = () => {
    frame = 0;
    if (stopped || motion.matches || document.hidden || !intersecting) return;
    const travel = Math.max(1, run.offsetHeight - stage.clientHeight);
    const progress = clamp(-run.getBoundingClientRect().top / travel);
    applyProgress(progress);
  };
  const schedule = () => {
    if (!frame && !stopped && !motion.matches && !document.hidden && intersecting) frame = requestAnimationFrame(update);
  };
  const fitArtDirection = () => {
    svg?.setAttribute("viewBox", compactArt.matches ? "132 0 1600 1000" : "0 0 1600 1000");
    schedule();
  };
  compactArt.addEventListener("change", fitArtDirection);
  run.classList.add("scene-ready");
  fitArtDirection();

  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    applyProgress(0);
  };
  const observe = new IntersectionObserver(([entry]) => {
    intersecting = entry.isIntersecting;
    stage.dataset.active = String(intersecting && !document.hidden);
    if (intersecting) schedule();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }, { rootMargin: "100% 0px" });
  const resize = new ResizeObserver(schedule);
  observe.observe(run);
  resize.observe(run);
  resize.observe(stage);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.visualViewport?.addEventListener("resize", schedule, { passive: true });
  document.addEventListener("visibilitychange", () => {
    stage.dataset.active = String(!document.hidden && intersecting);
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    } else schedule();
  });
  motion.addEventListener("change", () => {
    if (motion.matches) reset();
    else schedule();
  });
  window.addEventListener("pagehide", () => {
    stopped = true;
    if (frame) cancelAnimationFrame(frame);
    observe.disconnect();
    resize.disconnect();
  }, { once: true });
  schedule();
}

const notebookButton = document.querySelector<HTMLButtonElement>("[data-notebook-turn]");
const notebook = document.querySelector<HTMLElement>(".notebook-visual");
if (notebookButton && notebook) {
  const back = document.getElementById("notebook-notes");
  notebookButton.addEventListener("click", () => {
    const turned = notebook.dataset.page !== "back";
    notebook.dataset.page = turned ? "back" : "front";
    notebookButton.setAttribute("aria-expanded", String(turned));
    notebookButton.innerHTML = turned ? 'Turn back <span aria-hidden="true">↶</span>' : 'Turn the page <span aria-hidden="true">↗</span>';
    if (back) back.hidden = !turned;
  });
}

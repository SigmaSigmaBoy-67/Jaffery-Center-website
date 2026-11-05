import { createRoot, type Root } from "react-dom/client";
import "./glyph-intro.css";
import type { GlyphPortalProps } from "../components/ui/glyph-portal";

const ROOT_ID = "glyph-intro-root";
const SESSION_KEY = "jaffery-glyph-intro-v1";
let root: Root | null = null;
let finished = false;
let fallbackTimer = 0;

function revealSite(focusMain = false) {
  if (finished) return;
  finished = true;
  window.clearTimeout(fallbackTimer);
  try { sessionStorage.setItem(SESSION_KEY, "done"); } catch { /* session storage can be disabled */ }
  const html = document.documentElement;
  html.removeAttribute("data-glyph-intro");
  const introRoot = document.getElementById(ROOT_ID);
  if (introRoot) introRoot.style.pointerEvents = "none";
  if (focusMain) {
    requestAnimationFrame(() => {
      const main = document.querySelector<HTMLElement>("main");
      if (main) {
        if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }
    });
  }
  requestAnimationFrame(() => {
    root?.unmount();
    root = null;
    introRoot?.replaceChildren();
  });
}

const globalWindow = window as typeof window & { __jafferyFinishIntro?: (focus?: boolean) => void };
globalWindow.__jafferyFinishIntro = revealSite;

const introRoot = document.getElementById(ROOT_ID);
if (!introRoot || document.documentElement.dataset.glyphIntro !== "pending") {
  revealSite();
} else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealSite();
} else {
  fallbackTimer = window.setTimeout(() => revealSite(), 6500);
  const show = async () => {
    try {
      await Promise.race([
        document.fonts?.load('700 120px "DM Sans"', "JAFFERY") ?? Promise.resolve(),
        new Promise((resolve) => window.setTimeout(resolve, 900)),
      ]);
    } catch { /* use the local sans-serif fallback */ }
    if (finished || !introRoot.isConnected) return;
    const { default: GlyphPortal } = await import("../components/ui/glyph-portal");
    if (finished || !introRoot.isConnected) return;
    const skip = (
      <button className="intro-skip" type="button" data-gp-skip onClick={() => revealSite(true)}>
        Skip intro
      </button>
    );
    const portalProps: GlyphPortalProps = {
      autoPlay: true,
      autoDuration: 3000,
      portalReveal: true,
      focusChar: "A",
      fontFamily: '"DM Sans", Arial, sans-serif',
      word: "JAFFERY",
      background: <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "transparent" }} />,
      style: { "--gp-paper": "#FAF8F2", "--gp-ink": "#103B35", "--gp-field": "transparent", "--gp-foreground": "#103B35" },
      onComplete: () => revealSite(false),
      onProgress: (progress) => { if (progress >= 0.94) introRoot.style.pointerEvents = "none"; },
    };
    root = createRoot(introRoot);
    root.render(
      <>
        <GlyphPortal {...portalProps} />
        {skip}
      </>,
    );
  };
  void show().catch(() => revealSite());
}

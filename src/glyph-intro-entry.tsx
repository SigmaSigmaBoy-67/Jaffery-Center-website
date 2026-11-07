import { createRoot, type Root } from "react-dom/client";
import "./glyph-intro.css";
import type { GlyphPortalProps } from "../components/ui/glyph-portal";

const ROOT_ID = "glyph-intro-root";
const REACT_ROOT_ID = "glyph-intro-react-root";
const SESSION_KEY = "jaffery-glyph-intro-v1";
const debugMode = import.meta.env.DEV && new URLSearchParams(location.search).get("introDebug") === "1";
let root: Root | null = null;
let finished = false;
let fallbackTimer = 0;

function revealSite(focusMain = false, recordSuccess = true) {
  if (finished) return;
  finished = true;
  window.clearTimeout(fallbackTimer);
  if (recordSuccess && !debugMode) {
    try { sessionStorage.setItem(SESSION_KEY, "done"); } catch { /* session storage can be disabled */ }
  }
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
globalWindow.__jafferyFinishIntro = (focus = false) => revealSite(focus, true);

const introRoot = document.getElementById(ROOT_ID);
const reactMount = document.getElementById(REACT_ROOT_ID);
if (debugMode && introRoot && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.setAttribute("data-glyph-intro", "pending");
}
const introPending = !!introRoot && !!reactMount && document.documentElement.dataset.glyphIntro === "pending";
if (introPending && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  // Initialization failure is recoverable and does not consume the tab's first visit.
  if (!debugMode) fallbackTimer = window.setTimeout(() => revealSite(false, false), 12000);
  const show = async () => {
    let preferredFontLoaded = false;
    try {
      preferredFontLoaded = await Promise.race([
        document.fonts?.load('900 120px "DM Sans"', "WELCOME").then(() => true) ?? Promise.resolve(false),
        new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), 900)),
      ]);
    } catch { /* keep the measured local sans-serif fallback */ }
    if (finished || !introRoot.isConnected || !reactMount.isConnected) return;
    const measuredFont = preferredFontLoaded ? '"DM Sans", Arial, sans-serif' : "Arial, Helvetica, sans-serif";
    if (!preferredFontLoaded) introRoot.dataset.glyphFont = "fallback";
    const { default: GlyphPortal } = await import("../components/ui/glyph-portal");
    if (finished || !introRoot.isConnected || !reactMount.isConnected) return;
    const debugControls = debugMode ? (
      <nav className="intro-debug" aria-label="Glyph intro progress inspection">
        <span>Debug · progress</span>
        {[0, 25, 50, 75, 90, 100].map((percent) => (
          <button key={percent} type="button" data-intro-progress={percent} onClick={() => {
            window.dispatchEvent(new CustomEvent("glyph-portal-debug", { detail: percent / 100 }));
          }}>{percent}%</button>
        ))}
      </nav>
    ) : null;
    const portalProps: GlyphPortalProps = {
      autoPlay: true,
      autoDuration: 3200,
      debugMode,
      portalReveal: true,
      showForegroundGlyph: true,
      focusChar: "E",
      fontFamily: measuredFont,
      fontWeight: 900,
      word: "WELCOME",
      className: "glyph-portal-intro",
      background: <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "transparent" }} />,
      style: { "--gp-paper": "#FBFAF6", "--gp-ink": "#10332F", "--gp-field": "transparent", "--gp-foreground": "#10332F" },
      onComplete: () => revealSite(false, true),
      onFailure: () => revealSite(false, false),
      onProgress: (progress) => {
        if (progress <= 0.005 && introRoot.dataset.glyphActive !== "true") {
          if (!debugMode) {
            window.clearTimeout(fallbackTimer);
            fallbackTimer = window.setTimeout(() => revealSite(false, false), 20000);
          }
          const posterWord = introRoot.querySelector<HTMLElement>(".intro-poster-word");
          const scale = Number(reactMount.querySelector<HTMLElement>(".glyph-portal-intro")?.dataset.gpScale);
          if (posterWord && Number.isFinite(scale) && scale > 0) {
            posterWord.style.fontSize = `${scale * 100}px`;
            posterWord.style.letterSpacing = "0";
          }
          introRoot.dataset.glyphActive = "true";
          introRoot.querySelector(".intro-poster")?.remove();
        }
        if (progress >= 0.94) introRoot.style.pointerEvents = "none";
        else introRoot.style.pointerEvents = "auto";
      },
    };
    root = createRoot(reactMount);
    root.render(<><GlyphPortal {...portalProps} />{debugControls}</>);
  };
  void show().catch(() => revealSite(false, false));
} else if (introPending) {
  revealSite(false, false);
}

"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, BookOpenText, CalendarDays, Compass, GraduationCap, HeartHandshake, MapPin, Moon, Settings2, Sun, Users, X } from "lucide-react";

gsap.registerPlugin(useGSAP);

export type GlassSettings = { blur: number; opacity: number; saturation: number; tint: string; edge: number };
type DashboardView = "overview" | "programs" | "learning" | "visit";
type DashboardTheme = "light" | "dark";
export interface AdjustableGlassDashboardProps {
  brand?: string;
  backgroundImage?: string;
  glass?: Partial<GlassSettings>;
  onGlassChange?: (settings: GlassSettings) => void;
  theme?: DashboardTheme;
  className?: string;
  style?: CSSProperties;
}

const defaults: GlassSettings = { blur: 22, opacity: 0.3, saturation: 1.2, tint: "#ffffff", edge: 0.6 };
const views: { id: DashboardView; label: string; icon: typeof Compass }[] = [
  { id: "overview", label: "Overview", icon: Compass },
  { id: "programs", label: "Programs", icon: CalendarDays },
  { id: "learning", label: "Learning", icon: GraduationCap },
  { id: "visit", label: "Visit & contact", icon: MapPin },
];
const programs = [
  { name: "Muharram", category: "Faith & reflection", icon: Moon, description: "Lectures, supplications, remembrance, and reflection on the message of Imam Hussain (A.S.)." },
  { name: "Ramadan", category: "Faith & reflection", icon: HeartHandshake, description: "Gather for worship, learning, and community during the blessed month." },
  { name: "Eid gatherings", category: "Community", icon: Users, description: "Celebrate meaningful occasions and the joy of being together." },
  { name: "Sunday School", category: "Learning", icon: BookOpenText, description: "Qur’an, Arabic reading, and Islamic studies for children, supported by volunteer teachers." },
  { name: "Family gatherings", category: "Community", icon: Users, description: "Family-friendly opportunities to build friendships in the Roanoke community." },
];
const bounded = (value: number, min: number, max: number, fallback: number) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
const normalize = (value: Partial<GlassSettings>): GlassSettings => ({
  blur: bounded(value.blur ?? defaults.blur, 0, 40, defaults.blur),
  opacity: bounded(value.opacity ?? defaults.opacity, 0.08, 0.9, defaults.opacity),
  saturation: bounded(value.saturation ?? defaults.saturation, 0.5, 2, defaults.saturation),
  edge: bounded(value.edge ?? defaults.edge, 0, 1, defaults.edge),
  tint: /^#[0-9a-f]{6}$/i.test(value.tint ?? "") ? value.tint! : defaults.tint,
});

export default function AdjustableGlassDashboard({
  brand = "Jaffery Center",
  backgroundImage = "assets/house-of-light.svg",
  glass = defaults,
  onGlassChange,
  theme = "light",
  className = "",
  style,
}: AdjustableGlassDashboardProps) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const settingsTrigger = useRef<HTMLButtonElement>(null);
  const id = useId().replace(/:/g, "");
  const [view, setView] = useState<DashboardView>("overview");
  const [material, setMaterial] = useState(() => normalize(glass));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localTheme, setLocalTheme] = useState<DashboardTheme>(theme);
  const [backgroundFailed, setBackgroundFailed] = useState(false);

  useEffect(() => setMaterial(normalize(glass)), [glass.blur, glass.opacity, glass.saturation, glass.tint, glass.edge]);
  useEffect(() => setLocalTheme(theme), [theme]);
  useEffect(() => setBackgroundFailed(false), [backgroundImage]);
  useEffect(() => {
    root.current?.classList.add("agd-ready");
    return () => root.current?.classList.remove("agd-ready");
  }, []);
  useEffect(() => {
    if (settingsOpen) root.current?.querySelector<HTMLInputElement>(".agd-range input")?.focus();
  }, [settingsOpen]);
  useEffect(() => {
    if (!settingsOpen) return;
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
        settingsTrigger.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [settingsOpen]);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const panels = content.current?.querySelectorAll<HTMLElement>(".agd-reveal");
      if (!panels?.length) return;
      gsap.fromTo(panels, { y: 12, opacity: 0.45, filter: "blur(3px)" }, {
        y: 0, opacity: 1, filter: "blur(0px)", duration: 0.42, stagger: 0.045,
        ease: "power3.out", clearProps: "transform,opacity,filter",
      });
    });
    return () => media.revert();
  }, { scope: root, dependencies: [view], revertOnUpdate: true });

  function updateGlass(patch: Partial<GlassSettings>) {
    const next = normalize({ ...material, ...patch });
    setMaterial(next);
    onGlassChange?.(next);
  }
  function switchView(next: DashboardView) { setView(next); }
  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % views.length;
    else if (event.key === "ArrowLeft") next = (index + views.length - 1) % views.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = views.length - 1;
    else return;
    event.preventDefault();
    switchView(views[next].id);
    root.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  }

  const glassStyle = {
    "--agd-blur": `${material.blur}px`,
    "--agd-opacity": material.opacity,
    "--agd-saturation": material.saturation,
    "--agd-tint": material.tint,
    "--agd-edge": material.edge,
    ...style,
  } as CSSProperties;

  return (
    <div ref={root} className={`agd-root ${className}`} data-theme={localTheme} style={glassStyle}>
      {backgroundImage && !backgroundFailed && <img className="agd-background" src={backgroundImage} alt="" onError={() => setBackgroundFailed(true)} />}
      <div className="agd-backdrop" aria-hidden="true" />
      <div className="agd-workspace">
        <header className="agd-topbar agd-glass">
          <a className="agd-brand" href="index.html" aria-label={`${brand} home`}><img className="agd-brandmark" src="assets/brand/jaffery-center-monogram.png" alt="" width="32" height="32" /><strong>{brand}</strong><span className="agd-brand-divider" /><span className="agd-brand-label">Community guide</span></a>
          <div className="agd-toolbar">
            <button ref={settingsTrigger} className="agd-adjust" type="button" aria-expanded={settingsOpen} aria-controls={`${id}-settings`} onClick={() => setSettingsOpen(!settingsOpen)}><Settings2 size={16} aria-hidden="true" /><span>Adjust glass</span></button>
            <button className="agd-icon-button" type="button" aria-label={`Switch to ${localTheme === "light" ? "dark" : "light"} dashboard theme`} onClick={() => setLocalTheme(localTheme === "light" ? "dark" : "light")}>{localTheme === "light" ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}</button>
          </div>
        </header>
        <div className="agd-shell">
          <aside className="agd-rail agd-glass" aria-label="Community guide sections">
            {views.map((item) => <button key={item.id} type="button" aria-label={item.label} title={item.label} aria-current={view === item.id ? "page" : undefined} onClick={() => switchView(item.id)}><item.icon size={18} aria-hidden="true" /></button>)}
          </aside>
          <main className="agd-main agd-glass">
            <div className="agd-heading">
              <div><p className="agd-kicker">JAFFERY CENTER OF ROANOKE</p><h1>{view === "overview" ? "A place to belong." : view === "programs" ? "Programs & gatherings" : view === "learning" ? "Learning together" : "Plan your visit"}</h1></div>
              <span className="agd-location"><MapPin size={14} aria-hidden="true" /> Roanoke, Virginia</span>
            </div>
            <div className="agd-tabs" role="tablist" aria-label="Community guide">
              {views.map((item, index) => <button key={item.id} id={`${id}-${item.id}-tab`} role="tab" type="button" aria-selected={view === item.id} aria-controls={`${id}-${item.id}-panel`} tabIndex={view === item.id ? 0 : -1} onClick={() => switchView(item.id)} onKeyDown={(event) => onTabKeyDown(event, index)}><item.icon size={15} aria-hidden="true" /><span>{item.label}</span></button>)}
            </div>
            <div ref={content} key={view} className="agd-content">
              {view === "overview" && <section id={`${id}-overview-panel`} role="tabpanel" aria-labelledby={`${id}-overview-tab`} className="agd-overview">
                <div className="agd-welcome agd-card agd-reveal"><div><span className="agd-eyebrow">Faith · learning · community</span><h2>Welcome to a community<br />that grows together.</h2><p>Jaffery Center is a welcoming Shia Muslim community in Roanoke. Explore programs, learning for children, or plan a visit.</p><a className="agd-primary" href="about.html">Our story <ArrowRight size={15} aria-hidden="true" /></a></div><span className="agd-welcome-mark" aria-hidden="true">ج</span></div>
                <div className="agd-overview-grid">
                  <a className="agd-feature agd-card agd-reveal" href="programs.html"><CalendarDays size={20} aria-hidden="true" /><span className="agd-eyebrow">Come together</span><strong>Programs & gatherings</strong><span>Faith, learning, and family across the year.</span><i aria-hidden="true">↗</i></a>
                  <a className="agd-feature agd-card agd-reveal" href="sunday-school.html"><BookOpenText size={20} aria-hidden="true" /><span className="agd-eyebrow">For young learners</span><strong>Sunday School</strong><span>Qur’an, Arabic reading, and Islamic studies.</span><i aria-hidden="true">↗</i></a>
                  <a className="agd-feature agd-card agd-reveal" href="visit.html"><MapPin size={20} aria-hidden="true" /><span className="agd-eyebrow">Find your way</span><strong>Visit the center</strong><span>3031 Preston Avenue, Roanoke, Virginia.</span><i aria-hidden="true">↗</i></a>
                </div>
                <div className="agd-note agd-reveal"><CalendarDays size={17} aria-hidden="true" /><p><strong>Looking for a current schedule?</strong> Program dates and times are shared as they’re confirmed. <a href="visit.html">Contact the center</a> for the latest information.</p></div>
              </section>}
              {view === "programs" && <section id={`${id}-programs-panel`} role="tabpanel" aria-labelledby={`${id}-programs-tab`} className="agd-view-panel"><div className="agd-section-intro agd-reveal"><span className="agd-eyebrow">A year of shared moments</span><p>Explore the kinds of programs and gatherings at the center. Dates and times vary; please contact us for current details.</p></div><div className="agd-program-list">{programs.map((program) => <article className="agd-program agd-card agd-reveal" key={program.name}><span className="agd-program-icon"><program.icon size={19} aria-hidden="true" /></span><div><span className="agd-eyebrow">{program.category}</span><h2>{program.name}</h2><p>{program.description}</p></div><ArrowRight className="agd-row-arrow" size={16} aria-hidden="true" /></article>)}</div><a className="agd-text-link" href="programs.html">See the full programs page <ArrowRight size={15} aria-hidden="true" /></a></section>}
              {view === "learning" && <section id={`${id}-learning-panel`} role="tabpanel" aria-labelledby={`${id}-learning-tab`} className="agd-learning"><div className="agd-learning-lead agd-card agd-reveal"><span className="agd-program-icon"><BookOpenText size={22} aria-hidden="true" /></span><span className="agd-eyebrow">Sunday School · Roanoke</span><h2>Small steps.<br /><em>Strong foundations.</em></h2><p>Volunteer teachers support children as they learn Qur’an recitation, Arabic reading, and Islamic studies in an encouraging environment.</p><a className="agd-primary" href="sunday-school.html">Explore Sunday School <ArrowRight size={15} aria-hidden="true" /></a></div><div className="agd-learning-details"><article className="agd-detail agd-card agd-reveal"><GraduationCap size={19} aria-hidden="true" /><h3>Small classes</h3><p>Typically 6 to 18 students, with individual attention and encouragement.</p></article><article className="agd-detail agd-card agd-reveal"><BookOpenText size={19} aria-hidden="true" /><h3>Build confidence</h3><p>Support in Arabic reading and proper Qur’an pronunciation, step by step.</p></article><article className="agd-detail agd-card agd-reveal"><Users size={19} aria-hidden="true" /><h3>Grow in community</h3><p>Learning helps children connect with faith, family, and community.</p></article><p className="agd-small-note">Ask the center about registration and the current class schedule.</p></div></section>}
              {view === "visit" && <section id={`${id}-visit-panel`} role="tabpanel" aria-labelledby={`${id}-visit-tab`} className="agd-visit"><div className="agd-address agd-card agd-reveal"><span className="agd-eyebrow">You are welcome here</span><h2>Come by and say hello.</h2><p>For a specific program, contact the center before visiting to check current details.</p><address>Jaffery Center of Roanoke<br />3031 Preston Avenue<br />Roanoke, VA 24012</address><div className="agd-actions"><a className="agd-primary" href="https://www.google.com/maps/search/?api=1&amp;query=3031+Preston+Avenue+Roanoke+VA+24012" target="_blank" rel="noopener noreferrer">Get directions <ArrowRight size={15} aria-hidden="true" /></a><a className="agd-secondary" href="mailto:jafferycenter@gmail.com">Email the center</a></div></div><aside className="agd-contact agd-card agd-reveal"><span className="agd-eyebrow">Stay connected</span><h2>We’d be glad to hear from you.</h2><a href="mailto:jafferycenter@gmail.com">jafferycenter@gmail.com</a><p>Ask about programs, Sunday School, visiting, or requesting access to community updates.</p><a className="agd-text-link" href="visit.html">Visit & contact details <ArrowRight size={15} aria-hidden="true" /></a><hr /><h3>Program updates</h3><p>Dates and times vary. Current schedules are shared as they are confirmed.</p><a className="agd-text-link" href="programs.html">Browse programs <ArrowRight size={15} aria-hidden="true" /></a></aside></section>}
            </div>
            <footer className="agd-footer"><span><i />A welcoming Shia Muslim community in Roanoke, Virginia.</span><span>Original layered illustration · House of Light</span></footer>
          </main>
        </div>
      </div>
      {settingsOpen && <aside className="agd-settings agd-glass" id={`${id}-settings`} aria-label="Glass appearance controls"><div className="agd-settings-heading"><div><Settings2 size={18} aria-hidden="true" /><h2>Glass appearance</h2></div><button type="button" aria-label="Close glass settings" onClick={() => { setSettingsOpen(false); settingsTrigger.current?.focus(); }}><X size={17} aria-hidden="true" /></button></div><p>Adjust the clear, warm material across this guide.</p><div className="agd-material-sample" aria-hidden="true"><span>Jaffery Center</span></div>{([{ key: "blur", label: "Blur", min: 0, max: 40, step: 1, value: `${Math.round(material.blur)} px` }, { key: "opacity", label: "Opacity", min: .08, max: .9, step: .01, value: `${Math.round(material.opacity * 100)}%` }, { key: "saturation", label: "Saturation", min: .5, max: 2, step: .05, value: `${Math.round(material.saturation * 100)}%` }, { key: "edge", label: "Edge light", min: 0, max: 1, step: .05, value: `${Math.round(material.edge * 100)}%` }] as const).map((control) => <label className="agd-range" key={control.key}><span>{control.label}<output>{control.value}</output></span><input type="range" aria-label={control.label} min={control.min} max={control.max} step={control.step} value={material[control.key]} onChange={(event) => updateGlass({ [control.key]: Number(event.target.value) })} /></label>)}<label className="agd-tint">Glass tint <input type="color" aria-label="Glass tint" value={material.tint} onChange={(event) => updateGlass({ tint: event.target.value })} /></label><button className="agd-reset" type="button" onClick={() => updateGlass(normalize(defaults))}>Reset appearance</button></aside>}
    </div>
  );
}

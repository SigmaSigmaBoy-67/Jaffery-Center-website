"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import welcomeArch from "@/assets/hero-welcome-arch.jpg";
import mobileArch from "@/assets/hero-arch.jpg";
import "./inversion-circle-scroll-animation.css";

const BALL_SIZE = 380;
const clamp = (value: number) => Math.min(1, Math.max(0, value));

type InversionCircleScrollAnimationProps = {
  children?: ReactNode;
  title?: string;
  description?: string;
};

/**
 * Scroll-driven welcome portal. Unlike the original demo, this follows the
 * document scroll (not a nested 100vh scroller), so the rest of the site keeps
 * normal browser scrolling and anchor behavior.
 */
export default function InversionCircleScrollAnimation({
  children,
  title = "A place to belong.",
  description = "Faith, learning, and the joy of coming together. Everyone is welcome.",
}: InversionCircleScrollAnimationProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const lightLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const hero = heroRef.current;
    const ball = ballRef.current;
    const lightLayer = lightLayerRef.current;
    if (!track || !hero || !ball || !lightLayer) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let viewH = hero.clientHeight || window.innerHeight;
    let viewW = hero.clientWidth || window.innerWidth;

    const renderFrame = () => {
      frame = 0;
      if (reducedMotion.matches) return;
      viewH = hero.clientHeight || window.innerHeight;
      viewW = hero.clientWidth || window.innerWidth;
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const localScroll = Math.max(0, window.scrollY - trackTop);
      const p1 = clamp(localScroll / viewH);
      // One CSS pixel of tolerance guarantees the final frame when the browser
      // clamps fractional viewport heights at the sticky-track boundary.
      const p2 = clamp((localScroll - viewH + 1) / viewH);
      const p1e = p1 < 0.5 ? 8 * p1 ** 4 : 1 - ((-2 * p1 + 2) ** 4) / 2;
      const p2e = p2 * p2;
      const yOffset = (1 - p1e) * (viewH / 2 + BALL_SIZE / 2);
      const coverSize = Math.hypot(viewW, viewH) * 1.12;
      const ballSize = BALL_SIZE + p2e * (coverSize - BALL_SIZE);
      const radius = ballSize / 2;

      ball.style.transform = `translate3d(-50%, calc(-50% + ${yOffset}px), 0) scale(${ballSize / BALL_SIZE})`;
      lightLayer.style.clipPath = `circle(${radius}px at 50% calc(50% + ${yOffset}px))`;
      track.dataset.scrollProgress = String(clamp(localScroll / (viewH * 2)));
      track.dataset.phase = p1 < 1 ? "travel" : p2 < 1 ? "expand" : "complete";
    };
    const requestFrame = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(renderFrame);
    };
    const resizeObserver = new ResizeObserver(requestFrame);
    resizeObserver.observe(hero);
    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", requestFrame, { passive: true });
    reducedMotion.addEventListener("change", requestFrame);
    requestFrame();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestFrame);
      window.removeEventListener("resize", requestFrame);
      reducedMotion.removeEventListener("change", requestFrame);
    };
  }, []);

  return (
    <div className="icsa-experience">
      <div className="icsa-track" ref={trackRef} data-scroll-progress="0" data-phase="travel">
        <section className="icsa-hero" ref={heroRef} aria-labelledby="icsa-title">
          <picture className="icsa-backdrop">
            <source media="(max-width: 650px)" srcSet={mobileArch} />
            <img src={welcomeArch} alt="" fetchPriority="high" />
          </picture>
          <div className="icsa-scrim" aria-hidden="true" />
          <div className="icsa-ball" ref={ballRef} aria-hidden="true" />
          <div className="icsa-layer icsa-dark">
            <p className="icsa-kicker">JAFFERY CENTER <span>·</span> ROANOKE, VIRGINIA</p>
            <h1 id="icsa-title">{title}</h1>
            <p className="icsa-description">{description}</p>
          </div>
          <div className="icsa-layer icsa-light" ref={lightLayerRef} aria-hidden="true">
            <p className="icsa-kicker">JAFFERY CENTER <span>·</span> ROANOKE, VIRGINIA</p>
            <h2>{title}</h2>
            <p className="icsa-description">{description}</p>
          </div>
          <div className="icsa-hint" aria-hidden="true"><span>SCROLL TO ENTER</span><span>↓</span></div>
        </section>
      </div>
      <ContentSection>{children}</ContentSection>
    </div>
  );
}

function ContentSection({ children }: { children?: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setOn(true);
        observer.disconnect();
      }
    }, { threshold: 0.01 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`icsa-content${on ? " is-open" : ""}`}>
      {children}
    </section>
  );
}

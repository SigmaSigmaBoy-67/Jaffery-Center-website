"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import faithImage from "@/assets/hero-arch.jpg";
import learningImage from "@/assets/learning-room.jpg";
import communityImage from "@/assets/community-gathering.jpg";
import "./parallax-scroll-feature-section.css";

type Feature = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  linkLabel: string;
  reverse?: boolean;
};

const features: Feature[] = [
  {
    id: "faith",
    eyebrow: "Gather in faith",
    title: "A place to reflect and reconnect.",
    description: "Find space for worship, reflection, and religious programs rooted in faith and community.",
    imageUrl: faithImage,
    imageAlt: "An illustrated arch opening onto a peaceful mountain landscape at sunrise.",
    href: "programs.html",
    linkLabel: "Explore programs",
  },
  {
    id: "learning",
    eyebrow: "Learn together",
    title: "Room to learn, grow, and ask questions.",
    description: "Sunday School offers children a supportive place to explore Qur’an learning, Arabic, and Islamic values.",
    imageUrl: learningImage,
    imageAlt: "A sunlit learning table with books and pencils beside an arched window overlooking green mountains.",
    href: "sunday-school.html",
    linkLabel: "Discover Sunday School",
    reverse: true,
  },
  {
    id: "community",
    eyebrow: "Feel at home",
    title: "Good things happen when we gather.",
    description: "Meet neighbors, build friendships, and find a welcoming community here in Roanoke.",
    imageUrl: communityImage,
    imageAlt: "A warmly lit shared table in an arched room, prepared for a community gathering.",
    href: "visit.html",
    linkLabel: "Plan a visit",
  },
];

/** Scroll-led editorial feature sequence for the Jaffery Center homepage. */
export function ParallaxScrollFeatureSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="psfs" id="parallax-features" aria-labelledby="psfs-title">
      <header className="psfs-intro">
        <p className="psfs-kicker"><span>01</span> A way into community</p>
        <h2 id="psfs-title">Faith. Learning.<br /><em>Belonging.</em></h2>
        <p className="psfs-intro-copy">Every gathering begins with an open door. Take a look around and find your place.</p>
        <a className="psfs-scroll-cue" href="#psfs-feature-faith">
          <span>SCROLL TO EXPLORE</span><ArrowDown size={16} aria-hidden="true" />
        </a>
      </header>

      <div className="psfs-list">
        {features.map((feature, index) => (
          <ParallaxFeature key={feature.id} feature={feature} index={index} reducedMotion={!!reducedMotion} />
        ))}
      </div>
    </section>
  );
}

function ParallaxFeature({ feature, index, reducedMotion }: { feature: Feature; index: number; reducedMotion: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center start"],
  });

  const translateContent = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [48, -24]);
  const opacityImage = useTransform(scrollYProgress, [0, 0.72], reducedMotion ? [1, 1] : [0.25, 1]);
  const clipImage = useTransform(
    scrollYProgress,
    [0, 0.72],
    reducedMotion ? ["inset(0 0 0 0)", "inset(0 0 0 0)"] : ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
  );

  return (
    <article
      ref={sectionRef}
      id={`psfs-feature-${feature.id}`}
      className={cn("psfs-feature", feature.reverse && "psfs-feature--reverse")}
      aria-labelledby={`psfs-title-${feature.id}`}
    >
      <motion.div className="psfs-copy" style={{ y: translateContent }}>
        <p className="psfs-feature-label"><span>{String(index + 1).padStart(2, "0")}</span>{feature.eyebrow}</p>
        <h3 id={`psfs-title-${feature.id}`}>{feature.title}</h3>
        <p className="psfs-description">{feature.description}</p>
        <a className="psfs-link" href={feature.href}>
          {feature.linkLabel}<ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </motion.div>
      <motion.figure className="psfs-image-frame" style={{ opacity: opacityImage, clipPath: clipImage }}>
        <img src={feature.imageUrl} alt={feature.imageAlt} loading="lazy" decoding="async" />
        <figcaption><span>JAFFERY CENTER</span><span>ROANOKE, VIRGINIA</span></figcaption>
      </motion.figure>
    </article>
  );
}

export default ParallaxScrollFeatureSection;

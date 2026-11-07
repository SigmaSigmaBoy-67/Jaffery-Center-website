import { createRoot } from "react-dom/client";
import InversionCircleScrollAnimation from "@/components/ui/inversion-circle-scroll-animation";
import ParallaxScrollFeatureSection from "@/components/ui/parallax-scroll-feature-section";

const mount = document.getElementById("home-scroll-experience-root");
if (mount) {
  createRoot(mount).render(
    <InversionCircleScrollAnimation>
      <ParallaxScrollFeatureSection />
    </InversionCircleScrollAnimation>,
  );
}

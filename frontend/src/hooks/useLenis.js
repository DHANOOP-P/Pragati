import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const readHomeY = () => {
  const n = Number(sessionStorage.getItem("pragati_home_y") || 0);
  return Number.isFinite(n) ? n : 0;
};

const homeScroll = { y: readHomeY() };

const saveHomeY = (y) => {
  homeScroll.y = y;
  try {
    sessionStorage.setItem("pragati_home_y", String(Math.round(y)));
  } catch {
    /* private mode */
  }
};

export function useLenis() {
  const location = useLocation();
  const navType = useNavigationType();
  const lenisRef = useRef(null);
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;

    const lenis = new Lenis({ duration: 0.72, smoothWheel: true, lerp: 0.12 });
    lenisRef.current = lenis;
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      if (pathRef.current === "/") saveHomeY(lenis.scroll);
    });
    const ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const syncBoot = () => {
      if (document.body.classList.contains("is-booting")) lenis.stop();
      else lenis.start();
    };
    syncBoot();
    const mo = new MutationObserver(syncBoot);
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => {
      mo.disconnect();
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const save = () => {
      if (pathRef.current !== "/") return;
      saveHomeY(lenisRef.current?.scroll ?? window.scrollY);
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, []);

  useLayoutEffect(() => {
    const restoreHome = location.pathname === "/" && navType === "POP" && homeScroll.y > 8;
    const y = restoreHome ? homeScroll.y : 0;

    lenisRef.current?.scrollTo(y, { immediate: true, force: true });
    window.scrollTo(0, y);

    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [location.pathname, navType]);
}

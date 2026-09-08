import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const homeScroll = { y: 0 };

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

    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      if (pathRef.current === "/") homeScroll.y = lenis.scroll;
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
      homeScroll.y = lenisRef.current?.scroll ?? window.scrollY;
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, []);

  useEffect(() => {
    const restoreHome = location.pathname === "/" && navType === "POP" && homeScroll.y > 8;
    const y = restoreHome ? homeScroll.y : 0;

    const apply = () => {
      lenisRef.current?.scrollTo(y, { immediate: true });
      window.scrollTo(0, y);
      ScrollTrigger.refresh();
    };

    const ids = [requestAnimationFrame(apply)];
    if (restoreHome) {
      ids.push(requestAnimationFrame(() => requestAnimationFrame(apply)));
      const t1 = window.setTimeout(apply, 80);
      const t2 = window.setTimeout(apply, 320);
      return () => {
        ids.forEach((id) => cancelAnimationFrame(id));
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }

    return () => ids.forEach((id) => cancelAnimationFrame(id));
  }, [location.pathname, navType]);
}

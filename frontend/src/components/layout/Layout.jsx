import { useCallback, useLayoutEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../navigation/Navbar";
import Footer from "./Footer";
import Cursor from "../ui/Cursor";
import Atmosphere from "../atmosphere/Atmosphere";
import { useLenis } from "../../hooks/useLenis";
import { LayoutChromeProvider } from "./LayoutChrome";

const Layout = () => {
  useLenis();
  const location = useLocation();
  const [booting, setBooting] = useState(location.pathname === "/");
  const [hideFooter, setHideFooter] = useState(false);
  const setFooterHidden = useCallback((next) => setHideFooter(Boolean(next)), []);

  useLayoutEffect(() => {
    if (location.pathname !== "/") {
      setBooting(false);
      return undefined;
    }
    const sync = () => setBooting(document.body.classList.contains("is-booting"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [location.pathname]);

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <LayoutChromeProvider value={{ setHideFooter: setFooterHidden }}>
    <div className="relative min-h-screen bg-void text-paper">
      {!isAdmin && <Atmosphere />}
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
      <Cursor />
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="relative z-10"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      {!booting && !hideFooter && <Footer />}
    </div>
    </LayoutChromeProvider>
  );
};

export default Layout;

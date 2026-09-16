import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import BrandMark from "../ui/BrandMark";
import "./navbar.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/preevents", label: "Pre events" },
  { to: "/workshops", label: "Workshops" },
  { to: "/proshows", label: "Proshow" },
  { to: "/winners", label: "Points" },
  { to: "/certificates", label: "Certificate" },
];

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  const signOut = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const accountTo = user?.role === "admin" ? "/admin" : "/dashboard";
  const accountLabel = user?.role === "admin" ? "Desk" : "Profile";

  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-void from-30% to-transparent">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-10">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark className="h-9 w-auto md:h-10" />
            <span className="font-display text-lg tracking-[0.28em] mix-blend-difference">PRAGATI</span>
          </Link>
          <nav className="hidden items-center gap-7 mix-blend-difference lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-[11px] uppercase tracking-[0.28em] ${isActive ? "text-gold" : "text-paper/80"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <Link to={accountTo} className="text-[11px] uppercase tracking-[0.28em] text-gold">
                  {accountLabel}
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-[11px] uppercase tracking-[0.28em] text-paper/80 hover:text-gold"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="text-[11px] uppercase tracking-[0.28em]">
                Sign in
              </Link>
            )}
          </nav>
          <button
            type="button"
            className="nav-menu-trigger text-[11px] uppercase tracking-[0.3em] mix-blend-difference lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="nav-sheet-panel"
              initial={{ y: "8%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "6%", opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="nav-sheet-glow" aria-hidden />
              <div className="nav-sheet-glow nav-sheet-glow-b" aria-hidden />
              <p className="nav-sheet-watermark" aria-hidden>
                PRAGATI
              </p>

              <div className="nav-sheet-top">
                <BrandMark className="h-11 w-auto" decorative />
                <button type="button" className="nav-sheet-close" onClick={() => setOpen(false)} aria-label="Close menu">
                  <span>Close</span>
                  <span className="nav-sheet-close-x" aria-hidden>
                    ×
                  </span>
                </button>
              </div>

              <motion.nav className="nav-sheet-links" variants={listVariants} initial="hidden" animate="show">
                {links.map((l, i) => (
                  <motion.div key={l.to} variants={itemVariants}>
                    <NavLink
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) => `nav-sheet-link${isActive ? " is-active" : ""}`}
                    >
                      <span className="nav-sheet-index">{String(i + 1).padStart(2, "0")}</span>
                      <span className="nav-sheet-label">{l.label}</span>
                      <span className="nav-sheet-arrow" aria-hidden>
                        →
                      </span>
                    </NavLink>
                  </motion.div>
                ))}
              </motion.nav>

              <motion.div
                className="nav-sheet-foot"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.35 }}
              >
                {user ? (
                  <>
                    <Link to={accountTo} onClick={() => setOpen(false)} className="nav-sheet-account">
                      {accountLabel}
                    </Link>
                    <button type="button" className="nav-sheet-logout" onClick={signOut}>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)} className="nav-sheet-account">
                    Sign in
                  </Link>
                )}
                <p className="nav-sheet-tag">For the pursuit of righteous justice with art</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

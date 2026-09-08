import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import BrandMark from "../ui/BrandMark";

const CERTIFICATE_URL =
  "https://drive.google.com/drive/folders/1XQ0h_IaAfKm5y29VNC6OoCeNnbEH_vgC?usp=sharing";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/preevents", label: "Pre events" },
  { to: "/workshops", label: "Workshops" },
  { to: "/proshows", label: "Proshow" },
  { to: "/winners", label: "Points" },
  { href: CERTIFICATE_URL, label: "Certificate", external: true },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-void from-30% to-transparent">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:px-10">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark className="h-9 w-auto md:h-10" />
            <span className="font-display text-lg tracking-[0.28em] mix-blend-difference">
              PRAGATI
            </span>
          </Link>
          <nav className="hidden items-center gap-7 mix-blend-difference lg:flex">
            {links.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] uppercase tracking-[0.28em] text-paper/80"
                >
                  {l.label}
                </a>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `text-[11px] uppercase tracking-[0.28em] ${isActive ? "text-gold" : "text-paper/80"}`
                  }
                >
                  {l.label}
                </NavLink>
              )
            )}
            {user ? (
              <>
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"} className="text-[11px] uppercase tracking-[0.28em] text-gold">
                  {user.role === "admin" ? "Desk" : "File"}
                </Link>
                <button type="button" onClick={signOut} className="text-[11px] uppercase tracking-[0.28em] text-paper/80 hover:text-gold">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="text-[11px] uppercase tracking-[0.28em]">
                Sign in
              </Link>
            )}
          </nav>
          <button type="button" className="text-[11px] uppercase tracking-[0.3em] mix-blend-difference lg:hidden" onClick={() => setOpen(true)}>
            Menu
          </button>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 z-[70] flex flex-col justify-end bg-void px-8 pb-16"
          >
            <BrandMark className="absolute left-8 top-5 h-12 w-auto" decorative />
            <button type="button" className="absolute right-6 top-6 text-[11px] uppercase tracking-[0.3em]" onClick={() => setOpen(false)}>
              Close
            </button>
            {links.map((l, i) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="font-display text-5xl leading-tight"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {l.label}
                </a>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="font-display text-5xl leading-tight"
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  {l.label}
                </NavLink>
              )
            )}
            {user ? (
              <>
                <NavLink
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  onClick={() => setOpen(false)}
                  className="font-display text-5xl leading-tight text-gold"
                >
                  {user.role === "admin" ? "Desk" : "profile"}
                </NavLink>
                <button type="button" className="mt-8 text-left text-mute" onClick={signOut}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="mt-8 text-gold">
                Sign in
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

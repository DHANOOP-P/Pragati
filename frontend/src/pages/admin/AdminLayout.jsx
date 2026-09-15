import { NavLink, Outlet, useNavigate } from "react-router-dom";
import BrandMark from "../../components/ui/BrandMark";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/events", label: "Arts" },
  { to: "/admin/workshops", label: "Workshops" },
  { to: "/admin/proshows", label: "Proshow" },
  { to: "/admin/preevents", label: "Pre events" },
  { to: "/admin/ads", label: "Ads" },
  { to: "/admin/points", label: "Points" },
  { to: "/admin/winners", label: "Winners" },
  { to: "/admin/certificates", label: "Certificates" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/event-registrations", label: "Event registrations" },
  { to: "/admin/registrations", label: "Paid registrations" },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
  <div className="min-h-screen bg-void pt-24">
    <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 pb-20 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-52">
        <BrandMark className="mb-4 h-14 w-auto" />
        <p className="text-[11px] uppercase tracking-[0.35em] text-ember">Control</p>
        <h2 className="mt-2 font-display text-4xl">Desk</h2>
        <nav className="mt-6 flex flex-col">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `py-2 text-sm ${isActive ? "text-gold" : "text-mute hover:text-paper"}`}
            >
              {l.label}
            </NavLink>
          ))}
          <button
            type="button"
            className="mt-4 py-2 text-left text-sm text-ember hover:text-paper"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Logout
          </button>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  </div>
  );
};

export default AdminLayout;

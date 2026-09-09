import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ui/ProtectedRoute";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Workshops from "./pages/Workshops";
import Proshows from "./pages/Proshows";
import ItemDetail from "./pages/ItemDetail";
import Winners from "./pages/Winners";
import PreEventsPage from "./pages/PreEventsPage";
import AdminPreEvents from "./pages/admin/AdminPreEvents";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Unavailable from "./pages/Unavailable";
import Certificates from "./pages/Certificates";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminWorkshops from "./pages/admin/AdminWorkshops";
import AdminProshows from "./pages/admin/AdminProshows";
import AdminAds from "./pages/admin/AdminAds";
import AdminWinners from "./pages/admin/AdminWinners";
import AdminPoints from "./pages/admin/AdminPoints";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminRegistrations from "./pages/admin/AdminRegistrations";
import AdminEventRegistrations from "./pages/admin/AdminEventRegistrations";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<ItemDetail type="arts" />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/workshops/:id" element={<ItemDetail type="workshop" />} />
          <Route path="/proshows" element={<Proshows />} />
          <Route path="/proshows/:id" element={<ItemDetail type="proshow" />} />
          <Route path="/winners" element={<Winners />} />
          <Route path="/preevents" element={<PreEventsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/unavailable" element={<Unavailable />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute admin><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminOverview />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="workshops" element={<AdminWorkshops />} />
            <Route path="proshows" element={<AdminProshows />} />
            <Route path="ads" element={<AdminAds />} />
            <Route path="points" element={<AdminPoints />} />
            <Route path="winners" element={<AdminWinners />} />
            <Route path="preevents" element={<AdminPreEvents />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="event-registrations" element={<AdminEventRegistrations />} />
            <Route path="registrations" element={<AdminRegistrations />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;

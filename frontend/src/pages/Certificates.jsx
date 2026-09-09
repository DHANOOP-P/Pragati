import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { canSeeCertificates } from "../utils/collegeEmail";
import { CERTIFICATE_DRIVE_URL } from "../data/certificateDrive";
import "./certificates.css";

const Certificates = () => {
  const { user, ready } = useAuth();
  const location = useLocation();
  const allowed = canSeeCertificates(user);

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-gold">…</div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return (
    <article className="cert-page">
      <p className="cert-kicker">Desk</p>
      <h1>Certificates</h1>
      <p className="cert-lead">
        Only students of GECWyd who login the Google Drive with college mail id in the format
        name_admissionNumberBranch@gecwyd.ac.in can only access the certificates. Certificates are
        properly arranged as specific folders — find your certificate on the respective folder.
        Participation certificates, volunteer certificate and winners certificates are available now.
      </p>
      {!allowed ? (
        <p className="cert-lock">
          Sign in with a GEC Wayanad college mail like name_21b410cs@gecwyd.ac.in to open the Drive.
        </p>
      ) : null}
      <div className="cert-actions">
        {allowed ? (
          <a href={CERTIFICATE_DRIVE_URL} target="_blank" rel="noopener noreferrer">
            Open certificates
          </a>
        ) : (
          <Link to="/auth" state={{ from: location.pathname }}>
            Use college mail
          </Link>
        )}
      </div>
    </article>
  );
};

export default Certificates;

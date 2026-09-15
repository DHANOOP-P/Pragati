import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormBackdrop from "../components/forms/FormBackdrop";
import { CLASS_YEARS, DEPARTMENTS, SEMESTERS } from "../data/studentMeta";

const field =
  "mt-1 w-full border-b border-paper/20 bg-transparent py-2 text-paper outline-none focus:border-gold";
const selectField = `${field} bg-ink/80`;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    studentClass: "",
    semester: "",
    department: "",
    currentPassword: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setProfile((cur) => ({
      ...cur,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      college: user.college || "",
      studentClass: user.studentClass || "",
      semester: user.semester || "",
      department: user.department || "",
      currentPassword: "",
      password: "",
    }));
  }, [user]);

  const onChange = (e) => setProfile((f) => ({ ...f, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: String(profile.phone).replace(/\s+/g, ""),
        college: profile.college.trim(),
        studentClass: profile.studentClass,
        semester: profile.semester,
        department: profile.department,
      };
      if (profile.password || profile.email.trim().toLowerCase() !== String(user?.email || "").toLowerCase()) {
        payload.currentPassword = profile.currentPassword;
      }
      if (profile.password) payload.password = profile.password;

      const data = await updateProfile(payload);
      setMessage(data.message || "Profile updated");
      setProfile((cur) => ({ ...cur, currentPassword: "", password: "" }));
    } catch (err) {
      setError(err.message || "Could not update profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormBackdrop className="px-6 pb-24 pt-28 md:px-12">
      <Link to="/dashboard" className="text-[11px] uppercase tracking-[0.28em] text-mute hover:text-gold">
        Back to file
      </Link>
      <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-ember">Account</p>
      <h1 className="mt-2 font-display text-6xl">Edit profile</h1>
      <p className="mt-4 max-w-xl text-sm text-mute">
        Update your signup details. To change email or password, enter your current password.
      </p>

      <form onSubmit={saveProfile} className="mt-10 grid max-w-2xl gap-4 md:grid-cols-2">
        <label className="text-sm text-mute">
          Full name
          <input name="name" value={profile.name} onChange={onChange} className={field} required />
        </label>
        <label className="text-sm text-mute">
          Email
          <input name="email" type="email" value={profile.email} onChange={onChange} className={field} required />
        </label>
        <label className="text-sm text-mute">
          Phone
          <input name="phone" value={profile.phone} onChange={onChange} className={field} inputMode="numeric" required />
        </label>
        <label className="text-sm text-mute">
          College
          <input name="college" value={profile.college} onChange={onChange} className={field} required />
        </label>
        <label className="text-sm text-mute">
          Class year
          <select name="studentClass" value={profile.studentClass} onChange={onChange} className={selectField} required>
            <option value="">Select</option>
            {CLASS_YEARS.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-mute">
          Semester
          <select name="semester" value={profile.semester} onChange={onChange} className={selectField} required>
            <option value="">Select</option>
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-mute md:col-span-2">
          Department
          <select name="department" value={profile.department} onChange={onChange} className={selectField} required>
            <option value="">Select</option>
            {DEPARTMENTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-mute">
          Current password
          <input
            name="currentPassword"
            type="password"
            value={profile.currentPassword}
            onChange={onChange}
            className={field}
            placeholder="Needed for email / password change"
            autoComplete="current-password"
          />
        </label>
        <label className="text-sm text-mute">
          New password
          <input
            name="password"
            type="password"
            value={profile.password}
            onChange={onChange}
            className={field}
            placeholder="Leave blank to keep"
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        {error && <p className="text-ember md:col-span-2">{error}</p>}
        {message && <p className="text-gold md:col-span-2">{message}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 bg-ember px-8 py-3 text-[11px] uppercase tracking-[0.28em] disabled:opacity-50 md:col-span-2 md:w-fit"
        >
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </FormBackdrop>
  );
};

export default Profile;

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandMark from "../components/ui/BrandMark";
import FormBackdrop from "../components/forms/FormBackdrop";
import { CLASS_YEARS, DEPARTMENTS, SEMESTERS } from "../data/studentMeta";

const field = "mt-3 w-full border-b border-paper/20 bg-transparent py-3 text-paper outline-none focus:border-gold";
const selectField = `${field} bg-ink/80 text-paper`;

const safeFrom = (value) => {
  const path = String(value || "");
  if (path.startsWith("/") && !path.startsWith("//")) return path;
  return "/";
};

const emptySignup = {
  name: "",
  email: "",
  password: "",
  phone: "",
  college: "",
  studentClass: "",
  semester: "",
  department: "",
};

const titles = {
  login: "Return",
  signup: "Arrive",
  forgot: "Recover",
};

const Auth = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptySignup);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, signup, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setInfo("");
    setForm(emptySignup);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "forgot") {
        if (!form.email.trim()) {
          setError("Enter the registered email.");
          return;
        }
        const data = await forgotPassword(form.email.trim());
        setInfo(data.message || "Check your inbox for login details.");
        return;
      }
      if (mode === "login") await login({ email: form.email, password: form.password });
      else {
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.college.trim()) {
          setError("Name, email, phone and college are required.");
          return;
        }
        if (!form.studentClass || !form.semester || !form.department) {
          setError("Class, semester and department are required.");
          return;
        }
        if (!/^\d{10}$/.test(String(form.phone).replace(/\s+/g, ""))) {
          setError("Enter a valid 10-digit phone number.");
          return;
        }
        await signup({
          ...form,
          phone: String(form.phone).replace(/\s+/g, ""),
          name: form.name.trim(),
          college: form.college.trim(),
        });
      }
      navigate(safeFrom(location.state?.from));
    } catch (err) {
      console.error(err);
      const raw = String(err.message || "");
      setError(
        /SSL|tlsv1|openssl/i.test(raw)
          ? "Could not reach the database. Wait a few seconds and try again."
          : raw || "Could not sign you in."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormBackdrop className="flex items-center justify-center px-6 pt-24 pb-16">
      <form onSubmit={submit} className="w-full max-w-md">
        <BrandMark className="mb-6 h-16 w-auto" />
        <p className="text-[11px] uppercase tracking-[0.4em] text-ember">Threshold</p>
        <h1 className="mt-2 font-display text-6xl">{titles[mode]}</h1>
        <p className="mt-4 text-sm text-mute">
          {mode === "forgot"
            ? "Enter your registered email. We will send your login email and a new temporary password."
            : "Arts, the point table, and certificates need a college mail like name_21b410cs@gecwyd.ac.in. Workshops and proshows accept any account."}
        </p>
        {mode === "signup" && (
          <>
            <input
              name="name"
              placeholder="Full name *"
              value={form.name}
              onChange={onChange}
              className={`mt-8 ${field}`}
              required
            />
            <input
              name="phone"
              placeholder="Phone (10 digits) *"
              value={form.phone}
              onChange={onChange}
              className={field}
              inputMode="numeric"
              required
            />
            <input
              name="college"
              placeholder="College *"
              value={form.college}
              onChange={onChange}
              className={field}
              required
            />
            <select
              name="studentClass"
              value={form.studentClass}
              onChange={onChange}
              className={selectField}
              required
            >
              <option value="">Class year *</option>
              {CLASS_YEARS.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
            <select name="semester" value={form.semester} onChange={onChange} className={selectField} required>
              <option value="">Semester *</option>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
            <select name="department" value={form.department} onChange={onChange} className={selectField} required>
              <option value="">Department *</option>
              {DEPARTMENTS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </>
        )}
        <input
          name="email"
          type="email"
          placeholder="Email *"
          value={form.email}
          onChange={onChange}
          className={mode === "signup" ? field : `mt-8 ${field}`}
          required
        />
        {mode !== "forgot" && (
          <input
            name="password"
            type="password"
            placeholder="Password *"
            value={form.password}
            onChange={onChange}
            className={field}
            required
            minLength={6}
          />
        )}
        {error && <p className="mt-3 text-ember">{error}</p>}
        {info && <p className="mt-3 text-gold">{info}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-8 w-full bg-ember py-3 text-[11px] uppercase tracking-[0.32em] disabled:opacity-50"
        >
          {busy
            ? "Working…"
            : mode === "login"
              ? "Enter"
              : mode === "forgot"
                ? "Send login details"
                : "Create account"}
        </button>
        {mode === "login" && (
          <button type="button" onClick={() => switchMode("forgot")} className="mt-4 w-full text-sm text-mute hover:text-gold">
            Forgot credentials?
          </button>
        )}
        <button
          type="button"
          onClick={() => switchMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm text-gold"
        >
          {mode === "signup" ? "Have an account?" : mode === "forgot" ? "Back to sign in" : "Need an account?"}
        </button>
      </form>
    </FormBackdrop>
  );
};

export default Auth;

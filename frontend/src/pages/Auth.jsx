import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandMark from "../components/ui/BrandMark";

const field = "mt-3 w-full border-b border-paper/20 bg-transparent py-3 outline-none focus:border-gold";

const Auth = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", college: "" });
  const [error, setError] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") await login({ email: form.email, password: form.password });
      else await signup(form);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="relative z-20 flex min-h-screen items-center justify-center bg-void px-6 pt-24">
      <form onSubmit={submit} className="w-full max-w-md">
        <BrandMark className="mb-6 h-16 w-auto" />
        <p className="text-[11px] uppercase tracking-[0.4em] text-ember">Threshold</p>
        <h1 className="mt-2 font-display text-6xl">{mode === "login" ? "Return" : "Arrive"}</h1>
        <p className="mt-4 text-sm text-mute">
          Arts and the point table need a college mail like name_21b410cs@gecwyd.ac.in. Workshops and proshows accept any account.
        </p>
        {mode === "signup" && (
          <>
            <input name="name" placeholder="Full name" value={form.name} onChange={onChange} className={`mt-8 ${field}`} required />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} className={field} />
            <input name="college" placeholder="College" value={form.college} onChange={onChange} className={field} />
          </>
        )}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} className={mode === "signup" ? field : `mt-8 ${field}`} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} className={field} required />
        {error && <p className="mt-3 text-ember">{error}</p>}
        <button type="submit" className="mt-8 w-full bg-ember py-3 text-[11px] uppercase tracking-[0.32em]">
          {mode === "login" ? "Enter" : "Create account"}
        </button>
        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-4 w-full text-sm text-gold">
          {mode === "login" ? "Need an account?" : "Have an account?"}
        </button>
      </form>
    </div>
  );
};

export default Auth;

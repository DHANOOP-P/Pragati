import { useMemo, useState } from "react";
import { CLASS_YEARS, DEPARTMENTS, SEMESTERS, parseDepartmentFromEmail } from "../../data/studentMeta";

const inputClass = "mt-1 w-full border border-paper/15 bg-void px-3 py-2 text-paper";

const PaidRegisterForm = ({ item, user, busy, onCancel, onSubmit }) => {
  const [form, setForm] = useState(() => ({
    college: user?.college || "",
    studentClass: user?.studentClass || "",
    semester: user?.semester || "",
    department: user?.department || parseDepartmentFromEmail(user?.email) || "",
    phone: user?.phone || "",
  }));
  const [error, setError] = useState("");

  const ready = useMemo(() => {
    if (!form.college.trim() || !form.studentClass || !form.semester || !form.department || !form.phone.trim()) {
      return false;
    }
    return /^\d{10}$/.test(String(form.phone).replace(/\s+/g, ""));
  }, [form]);

  const setField = (name, value) => setForm((cur) => ({ ...cur, [name]: value }));

  const submit = (e) => {
    e.preventDefault();
    if (!ready) {
      setError("Fill college, class, semester, department and a 10-digit phone.");
      return;
    }
    setError("");
    onSubmit({
      studentName: user?.name || "",
      email: user?.email || "",
      college: form.college.trim(),
      studentClass: form.studentClass,
      semester: form.semester,
      department: form.department,
      phone: String(form.phone).replace(/\s+/g, ""),
    });
  };

  return (
    <form onSubmit={submit} className="mt-10 border border-paper/15 bg-ink/55 p-6 backdrop-blur-sm" noValidate>
      <p className="text-[11px] uppercase tracking-[0.3em] text-ember">Paid · ₹{item.price}</p>
      <h2 className="mt-2 font-display text-3xl">{item.title}</h2>
      <p className="mt-2 text-sm text-mute">All fields are required before payment. Ticket goes to your mail.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <label className="text-sm text-mute">
          Full name *
          <input value={user?.name || ""} readOnly className={inputClass} required />
        </label>
        <label className="text-sm text-mute">
          Email *
          <input value={user?.email || ""} readOnly className={inputClass} required />
        </label>
        <label className="text-sm text-mute">
          College *
          <input
            value={form.college}
            onChange={(e) => setField("college", e.target.value)}
            placeholder="College"
            className={inputClass}
            required
          />
        </label>
        <label className="text-sm text-mute">
          Phone (10 digits) *
          <input
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="Phone"
            className={inputClass}
            inputMode="numeric"
            required
          />
        </label>
        <label className="text-sm text-mute">
          Class year *
          <select
            value={form.studentClass}
            onChange={(e) => setField("studentClass", e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select class</option>
            {CLASS_YEARS.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-mute">
          Semester *
          <select value={form.semester} onChange={(e) => setField("semester", e.target.value)} className={inputClass} required>
            <option value="">Select semester</option>
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-mute md:col-span-2">
          Department *
          <select value={form.department} onChange={(e) => setField("department", e.target.value)} className={inputClass} required>
            <option value="">Select department</option>
            {DEPARTMENTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mt-4 text-ember">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy || !ready}
          className="bg-ember px-10 py-4 text-[11px] uppercase tracking-[0.32em] disabled:opacity-40"
        >
          {busy ? "Working…" : `Pay ₹${item.price}`}
        </button>
        <button type="button" disabled={busy} onClick={onCancel} className="px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-mute">
          Back
        </button>
      </div>
    </form>
  );
};

export default PaidRegisterForm;

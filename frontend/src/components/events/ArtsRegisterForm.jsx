import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import { CLASS_YEARS, DEPARTMENTS, HOUSE_NAMES, SEMESTERS, parseDepartmentFromEmail } from "../../data/studentMeta";

const inputClass = "mt-1 w-full border border-paper/15 bg-void px-3 py-2 text-paper";

const emptyMember = () => ({ name: "", studentClass: "", department: "" });

const ArtsRegisterForm = ({ item, user, busy, onCancel, onSubmit }) => {
  const kind = item.participationType === "group" ? "group" : "individual";
  const [houses, setHouses] = useState(HOUSE_NAMES);
  const [form, setForm] = useState(() => ({
    college: user?.college || "",
    studentClass: user?.studentClass || "",
    semester: user?.semester || "",
    houseName: user?.houseName || "",
    department: user?.department || parseDepartmentFromEmail(user?.email) || "",
    phone: user?.phone || "",
    members: kind === "group" ? [emptyMember()] : [],
  }));
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/catalog/points")
      .then((res) => {
        const names = (res.data || []).map((h) => h.name).filter(Boolean);
        if (names.length) setHouses(names);
      })
      .catch(() => {});
  }, []);

  const ready = useMemo(() => {
    if (
      !form.college.trim() ||
      !form.studentClass ||
      !form.semester ||
      !form.houseName ||
      !form.department ||
      !form.phone.trim()
    ) {
      return false;
    }
    if (!/^\d{10}$/.test(String(form.phone).replace(/\s+/g, ""))) return false;
    if (kind !== "group") return true;
    if (!form.members.length) return false;
    return form.members.every((m) => m.name.trim() && m.studentClass && m.department);
  }, [form, kind]);

  const setField = (name, value) => setForm((cur) => ({ ...cur, [name]: value }));

  const setMember = (index, name, value) => {
    setForm((cur) => ({
      ...cur,
      members: cur.members.map((row, i) => (i === index ? { ...row, [name]: value } : row)),
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!ready) {
      setError(
        kind === "group"
          ? "Fill all fields. Every group member needs name, class and department."
          : "Fill college, class, semester, house, department and a 10-digit phone."
      );
      return;
    }
    setError("");
    onSubmit({
      studentName: user?.name || "",
      email: user?.email || "",
      college: form.college.trim(),
      studentClass: form.studentClass,
      semester: form.semester,
      houseName: form.houseName,
      department: form.department,
      phone: String(form.phone).replace(/\s+/g, ""),
      members: kind === "group" ? form.members : [],
    });
  };

  return (
    <form onSubmit={submit} className="mt-10 border border-paper/15 bg-ink/55 p-6 backdrop-blur-sm" noValidate>
      <p className="text-[11px] uppercase tracking-[0.3em] text-ember">
        GECW only · {kind === "group" ? "Group" : "Individual"}
      </p>
      <h2 className="mt-2 font-display text-3xl">{item.title}</h2>
      <p className="mt-2 text-sm text-mute">All fields are required. College mail students only.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <label className="text-sm text-mute">
          {kind === "group" ? "Group leader *" : "Student name *"}
          <input value={user?.name || ""} readOnly className={inputClass} required />
        </label>
        <label className="text-sm text-mute">
          Mail id *
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
        <label className="text-sm text-mute">
          House *
          <select value={form.houseName} onChange={(e) => setField("houseName", e.target.value)} className={inputClass} required>
            <option value="">Select house</option>
            {houses.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-mute">
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

      {kind === "group" && (
        <div className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Group members *</p>
              <p className="mt-1 text-sm text-mute">Name, class and department required for every member.</p>
            </div>
            <button
              type="button"
              className="text-[11px] uppercase tracking-[0.22em] text-gold"
              onClick={() => setForm((cur) => ({ ...cur, members: [...cur.members, emptyMember()] }))}
            >
              Add member
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {form.members.map((member, i) => (
              <div key={i} className="grid gap-3 border border-paper/10 p-3 md:grid-cols-3">
                <input
                  value={member.name}
                  onChange={(e) => setMember(i, "name", e.target.value)}
                  placeholder="Member name *"
                  className={inputClass}
                  required
                />
                <select
                  value={member.studentClass}
                  onChange={(e) => setMember(i, "studentClass", e.target.value)}
                  className={inputClass}
                  required
                >
                  <option value="">Class *</option>
                  {CLASS_YEARS.map((year) => (
                    <option key={year} value={year}>
                      Year {year}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <select
                    value={member.department}
                    onChange={(e) => setMember(i, "department", e.target.value)}
                    className={`${inputClass} flex-1`}
                    required
                  >
                    <option value="">Department *</option>
                    {DEPARTMENTS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {form.members.length > 1 && (
                    <button
                      type="button"
                      className="text-ember"
                      onClick={() => setForm((cur) => ({ ...cur, members: cur.members.filter((_, idx) => idx !== i) }))}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-ember">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy || !ready}
          className="bg-ember px-10 py-4 text-[11px] uppercase tracking-[0.32em] disabled:opacity-40"
        >
          {busy ? "Working…" : "Confirm register"}
        </button>
        <button type="button" disabled={busy} onClick={onCancel} className="px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-mute">
          Back
        </button>
      </div>
    </form>
  );
};

export default ArtsRegisterForm;

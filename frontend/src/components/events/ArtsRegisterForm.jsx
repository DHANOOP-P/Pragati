import { useMemo, useState } from "react";
import { DEPARTMENTS, HOUSE_NAMES, parseDepartmentFromEmail } from "../../data/studentMeta";

const inputClass = "mt-1 w-full border border-paper/15 bg-transparent px-3 py-2 text-paper";

const emptyMember = () => ({ name: "", studentClass: "", department: "" });

const ArtsRegisterForm = ({ item, user, busy, onCancel, onSubmit }) => {
  const kind = item.participationType === "group" ? "group" : "individual";
  const [form, setForm] = useState(() => ({
    studentClass: user?.studentClass || "",
    houseName: user?.houseName || "",
    department: user?.department || parseDepartmentFromEmail(user?.email) || "",
    phone: user?.phone || "",
    members: kind === "group" ? [emptyMember()] : [],
  }));
  const [error, setError] = useState("");

  const ready = useMemo(() => {
    if (!form.studentClass || !form.houseName || !form.department || !form.phone) return false;
    if (kind !== "group") return true;
    return form.members.some((m) => m.name && m.studentClass && m.department);
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
      setError("Fill class, house, department, phone, and member details.");
      return;
    }
    setError("");
    onSubmit({
      studentClass: form.studentClass.trim(),
      houseName: form.houseName,
      department: form.department,
      phone: form.phone.trim(),
      members: kind === "group" ? form.members.filter((m) => m.name.trim()) : [],
    });
  };

  return (
    <form onSubmit={submit} className="mt-10 border border-paper/15 p-6">
      <p className="text-[11px] uppercase tracking-[0.3em] text-ember">
        GECW only · {kind === "group" ? "Group" : "Individual"}
      </p>
      <h2 className="mt-2 font-display text-3xl">{item.title}</h2>
      <p className="mt-2 text-sm text-mute">College mail students only. These details go to the admin desk.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <label className="text-sm text-mute">
          {kind === "group" ? "Group leader" : "Student name"}
          <input value={user?.name || ""} readOnly className={inputClass} />
        </label>
        <label className="text-sm text-mute">
          Mail id
          <input value={user?.email || ""} readOnly className={inputClass} />
        </label>
        <label className="text-sm text-mute">
          Class
          <input
            value={form.studentClass}
            onChange={(e) => setField("studentClass", e.target.value)}
            placeholder="S6 CSE"
            className={inputClass}
            required
          />
        </label>
        <label className="text-sm text-mute">
          House
          <select value={form.houseName} onChange={(e) => setField("houseName", e.target.value)} className={inputClass} required>
            <option value="">Select house</option>
            {HOUSE_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-mute">
          Department
          <select value={form.department} onChange={(e) => setField("department", e.target.value)} className={inputClass} required>
            <option value="">Select department</option>
            {DEPARTMENTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-mute">
          Phone number
          <input
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            placeholder="Phone"
            className={inputClass}
            required
          />
        </label>
      </div>

      {kind === "group" && (
        <div className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold">Group members</p>
              <p className="mt-1 text-sm text-mute">Name, class and department for each member.</p>
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
                  placeholder="Member name"
                  className={inputClass}
                  required={i === 0}
                />
                <input
                  value={member.studentClass}
                  onChange={(e) => setMember(i, "studentClass", e.target.value)}
                  placeholder="Class"
                  className={inputClass}
                  required={i === 0}
                />
                <div className="flex gap-2">
                  <select
                    value={member.department}
                    onChange={(e) => setMember(i, "department", e.target.value)}
                    className={`${inputClass} flex-1`}
                    required={i === 0}
                  >
                    <option value="">Department</option>
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
        <button type="submit" disabled={busy} className="bg-ember px-10 py-4 text-[11px] uppercase tracking-[0.32em] disabled:opacity-40">
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

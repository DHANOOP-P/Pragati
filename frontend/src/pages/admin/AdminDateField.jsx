const pad = (n) => String(n).padStart(2, "0");

export const toLocalDateTime = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 16);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const split = (value) => {
  const raw = toLocalDateTime(value);
  if (!raw) return { date: "", time: "10:00" };
  const [date, time] = raw.split("T");
  return { date: date || "", time: (time || "10:00").slice(0, 5) };
};

const AdminDateField = ({ name, value, onChange }) => {
  const { date, time } = split(value);

  const update = (nextDate, nextTime) => {
    onChange(name, nextDate ? `${nextDate}T${nextTime || "10:00"}` : "");
  };

  return (
    <span className="admin-date mt-1 grid grid-cols-2 gap-2">
      <input
        type="date"
        value={date}
        onChange={(e) => update(e.target.value, time)}
        className="admin-date-input w-full border border-paper/15 bg-void px-3 py-2 text-paper"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => update(date, e.target.value)}
        className="admin-date-input w-full border border-paper/15 bg-void px-3 py-2 text-paper"
      />
    </span>
  );
};

export default AdminDateField;

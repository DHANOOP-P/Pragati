import { useEffect, useState } from "react";
import api from "../../api/client";
import AdminDateField, { toLocalDateTime } from "./AdminDateField";
import { mediaUrl } from "../../utils/media";
import {
  adminDeleteBtn,
  adminTable,
  adminTableWrap,
  adminTd,
  adminTdMute,
  adminTh,
  adminTr,
} from "./adminTable";
import "./adminForm.css";

const AdminCrud = ({ title, endpoint, fields, defaults }) => {
  const [items, setItems] = useState([]);
  const [library, setLibrary] = useState([]);
  const [form, setForm] = useState(defaults);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");

  const load = () => api.get(endpoint).then((res) => setItems(res.data)).catch((err) => setError(err.message));

  useEffect(() => {
    load();
    api
      .get("/admin/media")
      .then((res) => setLibrary(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLibrary([]));
  }, [endpoint]);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value }));
  };

  const onImage = async (name, file) => {
    if (!file) return;
    setUploading(name);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const { data } = await api.post("/admin/media", body);
      setForm((f) => ({ ...f, [name]: data.url }));
      if (data.url) setLibrary((cur) => [{ url: data.url, publicId: data.publicId || "" }, ...cur.filter((item) => item.url !== data.url)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading("");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) await api.put(`${endpoint}/${editing}`, form);
      else await api.post(endpoint, form);
      setForm(defaults);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (item) => {
    const next = { ...defaults };
    fields.forEach((f) => {
      next[f.name] = f.type === "datetime" && item[f.name] ? toLocalDateTime(item[f.name]) : item[f.name] ?? defaults[f.name];
    });
    setForm(next);
    setEditing(item._id);
  };

  const imageSrc = (item) => item.image || item.media || "";

  return (
    <div>
      <h1 className="font-display text-4xl">{title}</h1>
      <form onSubmit={submit} className="mt-6 grid gap-3 border border-paper/10 p-5 md:grid-cols-2">
        {fields.map((f) => (
          <label key={f.name} className="text-sm text-mute">
            {f.label}
            {f.type === "checkbox" ? (
              <input type="checkbox" name={f.name} checked={Boolean(form[f.name])} onChange={onChange} className="ml-3" />
            ) : f.type === "select" ? (
              <select name={f.name} value={form[f.name] ?? ""} onChange={onChange} className="mt-1 w-full border border-paper/15 bg-void px-3 py-2 text-paper">
                {(f.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea name={f.name} value={form[f.name] ?? ""} onChange={onChange} className="mt-1 w-full border border-paper/15 bg-transparent px-3 py-2" rows={3} />
            ) : f.type === "datetime" ? (
              <AdminDateField
                name={f.name}
                value={form[f.name] ?? ""}
                onChange={(name, next) => setForm((cur) => ({ ...cur, [name]: next }))}
              />
            ) : f.type === "image" ? (
              <span className="mt-1 block">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  disabled={Boolean(uploading)}
                  onChange={(e) => onImage(f.name, e.target.files?.[0])}
                  className="w-full border border-paper/15 bg-transparent px-3 py-2 file:mr-3 file:border-0 file:bg-ember file:px-3 file:py-1 file:text-[10px] file:uppercase file:tracking-[0.2em] file:text-paper"
                />
                {uploading === f.name && <span className="mt-2 block text-gold">Uploading…</span>}
                {form[f.name] && (
                  <img src={mediaUrl(form[f.name], 480)} alt="" className="mt-3 h-28 w-full object-cover" />
                )}
                {library.length > 0 && (
                  <span className="mt-3 flex flex-wrap gap-2">
                    {library.slice(0, 12).map((shot) => (
                      <button
                        key={shot.publicId || shot.url}
                        type="button"
                        onClick={() => setForm((cur) => ({ ...cur, [f.name]: shot.url }))}
                        className={`h-12 w-12 overflow-hidden border ${form[f.name] === shot.url ? "border-gold" : "border-paper/20"}`}
                      >
                        <img src={mediaUrl(shot.url, 96)} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </span>
                )}
              </span>
            ) : (
              <input
                type={f.type}
                name={f.name}
                value={form[f.name] ?? ""}
                onChange={onChange}
                className="mt-1 w-full border border-paper/15 bg-transparent px-3 py-2"
              />
            )}
          </label>
        ))}
        <div className="md:col-span-2">
          {error && <p className="mb-2 text-ember">{error}</p>}
          <button disabled={Boolean(uploading)} className="bg-ember px-6 py-2 text-[11px] uppercase tracking-[0.28em] disabled:opacity-40">
            {editing ? "Save" : "Create"}
          </button>
        </div>
      </form>
      <div className="mt-8">
        <p className="mb-3 text-sm text-mute">{items.length} item{items.length === 1 ? "" : "s"}</p>
        <div className={adminTableWrap}>
          <table className={`${adminTable} min-w-[640px]`}>
            <thead>
              <tr className="border-b border-paper/15 bg-paper/[0.03]">
                <th className={adminTh}>Item</th>
                <th className={adminTh}>Preview</th>
                <th className={adminTh}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className={adminTr}>
                  <td className={`${adminTd} font-medium`}>
                    {item.title || item.studentName || item.eventTitle || "—"}
                  </td>
                  <td className={adminTdMute}>
                    {imageSrc(item) ? (
                      <img src={mediaUrl(imageSrc(item), 96)} alt="" className="h-12 w-12 object-cover" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={`${adminTd} text-right`}>
                    <div className="flex justify-end gap-4">
                      <button type="button" onClick={() => edit(item)} className="text-[11px] uppercase tracking-[0.2em] text-gold">
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!window.confirm("Delete this item?")) return;
                          await api.delete(`${endpoint}/${item._id}`);
                          load();
                        }}
                        className={adminDeleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && <p className="px-4 py-6 text-sm text-mute">No items yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminCrud;

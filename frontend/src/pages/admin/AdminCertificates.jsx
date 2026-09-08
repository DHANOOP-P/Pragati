import { useEffect, useState } from "react";
import api from "../../api/client";

const AdminCertificates = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const load = () => api.get("/admin/certificates").then((res) => setItems(res.data));
  useEffect(() => {
    load().catch(console.error);
  }, []);

  const upload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const data = new FormData();
    [...files].forEach((f) => data.append("files", f));
    try {
      const res = await api.post("/admin/certificates", data);
      setStatus(res.data.message);
      load();
    } catch (err) {
      setStatus(err.message);
    }
    e.target.value = "";
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Certificates</h1>
      <p className="mt-3 text-mute">PDF filename = student name.</p>
      <label className="mt-6 inline-block cursor-pointer bg-ember px-6 py-3 text-[11px] uppercase tracking-[0.28em]">
        Upload
        <input type="file" accept="application/pdf" multiple className="hidden" onChange={upload} />
      </label>
      {status && <p className="mt-3 text-gold">{status}</p>}
      <div className="mt-8 space-y-3">
        {items.map((c) => (
          <div key={c._id} className="flex justify-between border border-paper/10 px-4 py-3">
            <span>{c.studentName} · {c.matched ? "matched" : "unmatched"}</span>
            <button
              type="button"
              className="text-ember"
              onClick={async () => {
                await api.delete(`/admin/certificates/${c._id}`);
                load();
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCertificates;

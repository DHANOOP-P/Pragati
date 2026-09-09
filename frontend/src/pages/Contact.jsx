import { useState } from "react";
import api from "../api/client";
import "./contact.css";

const empty = { name: "", email: "", message: "", company: "" };

const Contact = () => {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setStatus({ type: "", text: "" });
    try {
      await api.post("/contact", form);
      setForm(empty);
      setStatus({ type: "ok", text: "Sent. The desk will write back to your mail." });
    } catch (err) {
      setStatus({ type: "err", text: err.message || "Could not send that note." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="contact-page">
      <header className="contact-hero">
        <p className="contact-kicker">Desk</p>
        <h1>Contact</h1>
      </header>

      <div className="contact-grid">
        <div className="contact-details">
        <p>GEC Wayanad, Kerala</p>
          <a href="mailto:pragati2024lead@gmail.com">pragati2024lead@gmail.com</a>
          
          <p>Farshan Yousuf (Union chairperson) : 7510388907</p>
          <p>Adith K (Union General secretary) : 9061749122</p>
          <p>Dhanoop P (Union Arts club secretary) : 8330840596</p>
          <a href="https://www.instagram.com/pragati_gecw" target="_blank" rel="noreferrer" className="contact-ig">
            @pragati_gecw
          </a>
        </div>

        <form className="contact-form" onSubmit={submit} noValidate>
          <p className="contact-form-kicker">Write to the desk</p>
          <label>
            Name
            <input name="name" value={form.name} onChange={onChange} maxLength={80} required autoComplete="name" />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              maxLength={120}
              required
              autoComplete="email"
            />
          </label>
          <label className="contact-honey" aria-hidden="true">
            Company
            <input name="company" value={form.company} onChange={onChange} tabIndex={-1} autoComplete="off" />
          </label>
          <label>
            Message
            <textarea name="message" value={form.message} onChange={onChange} maxLength={2000} rows={5} required />
          </label>
          {status.text ? <p className={status.type === "ok" ? "contact-ok" : "contact-err"}>{status.text}</p> : null}
          <button type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </article>
  );
};

export default Contact;

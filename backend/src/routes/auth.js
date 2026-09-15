import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { protect, signToken } from "../middleware/auth.js";
import { hasSmtp, sendMail } from "../utils/email.js";

const router = Router();

function publicDbError(err) {
  const raw = String(err?.message || "");
  if (/SSL|tlsv1|ENOTFOUND|ECONNRESET|server selection|timed out|Mongo/i.test(raw)) {
    return "Could not reach the database. Allow 0.0.0.0/0 in Atlas Network Access, then try again.";
  }
  return "Could not sign you in. Try again.";
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    college: user.college,
    studentClass: user.studentClass || "",
    semester: user.semester || "",
    houseName: user.houseName || "",
    department: user.department || "",
    role: user.role,
  };
}

function tempPassword() {
  return crypto.randomBytes(4).toString("hex") + "A1";
}

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone = "",
      college = "",
      studentClass = "",
      semester = "",
      department = "",
    } = req.body;
    if (!name || !email || !password || !phone || !college || !studentClass || !semester || !department) {
      return res.status(400).json({
        message: "Name, email, phone, college, class, semester, department and password are required",
      });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!/^\d{10}$/.test(String(phone).replace(/\s+/g, ""))) {
      return res.status(400).json({ message: "Enter a valid 10-digit phone number" });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashed,
      phone: String(phone).replace(/\s+/g, ""),
      college: String(college).trim(),
      studentClass: String(studentClass).trim(),
      semester: String(semester).trim().toUpperCase(),
      department: String(department).trim().toUpperCase(),
    });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(503).json({ message: publicDbError(err) });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(503).json({ message: publicDbError(err) });
  }
});

/** Email a new temporary password — old passwords cannot be recovered (hashed). */
router.post("/forgot-password", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .toLowerCase()
      .trim();
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!hasSmtp()) {
      return res.status(503).json({ message: "Mail is not configured yet. Ask the desk to set SMTP." });
    }

    const user = await User.findOne({ email });
    // Same reply whether or not the account exists (avoid account fishing)
    if (!user) {
      return res.json({
        message: "If that email is registered, login details were sent. Check your inbox.",
      });
    }

    const password = tempPassword();
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    const loginUrl = `${(process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "")}/auth`;
    await sendMail({
      to: user.email,
      subject: "Pragati — your login details",
      text: `Hello ${user.name},\n\nYour Pragati login details:\nEmail: ${user.email}\nTemporary password: ${password}\n\nSign in: ${loginUrl}\nChange this password after you enter.\n`,
      html: `
        <div style="font-family:Georgia,serif;background:#0b0b0b;color:#f7f1e3;padding:32px">
          <h1 style="letter-spacing:6px;color:#d4af37">PRAGATI</h1>
          <p>Hello ${user.name},</p>
          <p>Your login details (a new temporary password was created):</p>
          <p><strong>Email:</strong> ${user.email}<br/>
          <strong>Temporary password:</strong> ${password}</p>
          <p><a href="${loginUrl}" style="color:#d4af37">Sign in here</a>, then change your password if you can.</p>
        </div>
      `,
    });

    res.json({ message: "If that email is registered, login details were sent. Check your inbox." });
  } catch (err) {
    console.error(err);
    const raw = String(err?.message || "");
    if (/SSL|tlsv1|ENOTFOUND|ECONNRESET|server selection|timed out|Mongo/i.test(raw)) {
      return res.status(503).json({ message: publicDbError(err) });
    }
    res.status(503).json({ message: "Could not send mail. Check SMTP / Mailjet sender and try again." });
  }
});

router.get("/me", protect, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Account not found" });

    const {
      name,
      email,
      phone,
      college,
      studentClass,
      semester,
      department,
      password,
      currentPassword,
    } = req.body;

    if (name != null) {
      const next = String(name).trim();
      if (!next) return res.status(400).json({ message: "Name is required" });
      user.name = next;
    }

    if (phone != null) {
      const next = String(phone).replace(/\s+/g, "");
      if (!/^\d{10}$/.test(next)) {
        return res.status(400).json({ message: "Enter a valid 10-digit phone number" });
      }
      user.phone = next;
    }

    if (college != null) {
      const next = String(college).trim();
      if (!next) return res.status(400).json({ message: "College is required" });
      user.college = next;
    }

    if (studentClass != null) {
      const next = String(studentClass).trim();
      if (!next) return res.status(400).json({ message: "Class is required" });
      user.studentClass = next;
    }

    if (semester != null) {
      const next = String(semester).trim().toUpperCase();
      if (!next) return res.status(400).json({ message: "Semester is required" });
      user.semester = next;
    }

    if (department != null) {
      const next = String(department).trim().toUpperCase();
      if (!next) return res.status(400).json({ message: "Department is required" });
      user.department = next;
    }

    const changingEmail = email != null && String(email).toLowerCase().trim() !== user.email;
    const changingPassword = password != null && String(password).length > 0;

    if (changingEmail || changingPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required to change email or password" });
      }
      const ok = await bcrypt.compare(String(currentPassword), user.password);
      if (!ok) return res.status(401).json({ message: "Current password is incorrect" });
    }

    if (changingEmail) {
      const nextEmail = String(email).toLowerCase().trim();
      if (!nextEmail) return res.status(400).json({ message: "Email is required" });
      const taken = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
      if (taken) return res.status(409).json({ message: "Email already registered" });
      user.email = nextEmail;
    }

    if (changingPassword) {
      if (String(password).length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      user.password = await bcrypt.hash(String(password), 10);
    }

    await user.save();
    res.json({ user: publicUser(user), message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(503).json({ message: publicDbError(err) });
  }
});

export default router;

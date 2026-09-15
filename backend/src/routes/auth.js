import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect, signToken } from "../middleware/auth.js";

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
    houseName: user.houseName || "",
    department: user.department || "",
    role: user.role,
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone = "", college = "" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: String(email).toLowerCase(),
      password: hashed,
      phone,
      college,
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

router.get("/me", protect, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;

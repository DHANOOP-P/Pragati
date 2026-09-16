import { cleanText, DEPARTMENTS, SEMESTERS } from "./studentMeta.js";

export function normalizePhone(value = "") {
  return String(value || "").replace(/\s+/g, "");
}

export function parseRegistrationDetails(body = {}, user = {}) {
  const studentName = cleanText(body.studentName || body.name || user.name);
  const email = cleanText(body.email || user.email).toLowerCase();
  const phone = normalizePhone(body.phone || user.phone);
  const college = cleanText(body.college || user.college);
  const studentClass = cleanText(body.studentClass || body.class);
  const semester = cleanText(body.semester).toUpperCase();
  const department = cleanText(body.department).toUpperCase();
  const houseName = cleanText(body.houseName);

  return { studentName, email, phone, college, studentClass, semester, department, houseName };
}

export function validateRegistrationDetails(details, { requireHouse = false } = {}) {
  const { studentName, email, phone, college, studentClass, semester, department, houseName } = details;
  if (!studentName || !email || !phone || !college || !studentClass || !semester || !department) {
    return "Name, email, phone, college, class, semester and department are required.";
  }
  if (!/^\d{10}$/.test(phone)) {
    return "Enter a valid 10-digit phone number.";
  }
  if (!SEMESTERS.includes(semester)) {
    return "Choose a valid semester.";
  }
  if (!DEPARTMENTS.includes(department)) {
    return "Choose a valid department.";
  }
  if (requireHouse && !houseName) {
    return "Class, house, department, phone, college and semester are required.";
  }
  return "";
}

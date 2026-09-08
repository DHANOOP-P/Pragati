export const HOUSE_NAMES = ["Themis", "Maat", "Justitia", "Rashnu", "Lugh", "Marduk"];
export const DEPARTMENTS = ["CSE", "ECE", "EEE", "ME", "CE"];

const DEPT_FROM_SUFFIX = {
  cs: "CSE",
  cse: "CSE",
  ec: "ECE",
  ece: "ECE",
  ee: "EEE",
  eee: "EEE",
  me: "ME",
  ce: "CE",
};

export function parseDepartmentFromEmail(email = "") {
  const match = String(email)
    .trim()
    .toLowerCase()
    .match(/_\d+[a-z0-9]*?([a-z]+)@gecwyd\.ac\.in$/);
  if (!match) return "";
  return DEPT_FROM_SUFFIX[match[1]] || "";
}

export function cleanText(value = "") {
  return String(value || "").trim();
}

export function cleanMember(row = {}) {
  return {
    name: cleanText(row.name),
    studentClass: cleanText(row.studentClass || row.className || row.class),
    department: cleanText(row.department).toUpperCase(),
  };
}

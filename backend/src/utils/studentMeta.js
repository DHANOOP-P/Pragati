export const HOUSE_TABLE = [
  { name: "Themis", points: 288, order: 1 },
  { name: "Maat", points: 252, order: 2 },
  { name: "Justitia", points: 127, order: 3 },
  { name: "Rashnu", points: 94, order: 4 },
  { name: "Lugh", points: 72, order: 5 },
  { name: "Marduk", points: 62, order: 6 },
];

export const HOUSE_NAMES = HOUSE_TABLE.map((row) => row.name);
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

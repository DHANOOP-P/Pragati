export const HOUSE_NAMES = ["Themis", "Maat", "Justitia", "Rashnu", "Lugh", "Marduk"];
export const DEPARTMENTS = ["CSE", "ECE", "EEE", "ME", "CE"];
export const SEMESTERS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
export const CLASS_YEARS = ["1", "2", "3", "4"];

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

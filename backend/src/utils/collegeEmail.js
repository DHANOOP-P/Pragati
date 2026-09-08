export const COLLEGE_EMAIL_REGEX = /^[a-zA-Z]+_\d+[a-zA-Z0-9]+@gecwyd\.ac\.in$/i;

export function isCollegeEmail(email = "") {
  return COLLEGE_EMAIL_REGEX.test(String(email).trim());
}

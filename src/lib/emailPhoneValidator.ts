export type ValidType = "email" | "phone";

export const validate = (value: string): ValidType | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+91)?\d{10}$/;

  // Returns true if it matches either pattern
  // return emailRegex.test(value) || phoneRegex.test(value);
  if (emailRegex.test(value)) return "email";
  if (phoneRegex.test(value)) return "phone";

  return null;
};

export function isValidType(value: string): value is ValidType {
  return value === "email" || value === "phone";
}
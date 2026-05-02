export type ValidType = "email" | "phone";

export const validate = (value: string): ValidType | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Requires '+' followed by country code and number (Total 11-15 characters)
  const phoneRegex = /^\+\d{10,14}$/;

  // Returns true if it matches either pattern
  // return emailRegex.test(value) || phoneRegex.test(value);
  if (emailRegex.test(value)) return "email";
  if (phoneRegex.test(value)) return "phone";

  return null;
};

export function isValidType(value: string): value is ValidType {
  return value === "email" || value === "phone";
}
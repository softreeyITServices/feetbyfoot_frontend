export type ValidType = "email" | "phone";

export const validate = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/; // Adjust based on your region's format

  // Returns true if it matches either pattern
  return emailRegex.test(value) || phoneRegex.test(value);
};

export function isValidType(value: string): value is ValidType {
  return value === "email" || value === "phone";
}
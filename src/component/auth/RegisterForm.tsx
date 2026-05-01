"use client";

import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { authService } from "@/domain/application/services/auth.service";
import { AuthError } from "@/domain/application/errors/AuthError";
import { AutoCloseMessage } from "../ui/AutoCloseMessage";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const isFormValid =
    formValues.name.trim() &&
    formValues.email.trim() &&
    formValues.phone.trim();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setFieldErrors({});

    try {
      const response = await authService.register({
        ...formValues,
        role: "customer",
      });

      setSuccess(response.data?.message || "Registration successful!");
      setFormValues({ name: "", email: "", phone: "" });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "data" in err
      ) {
        const data = (err as { data?: unknown }).data;

        if (
          typeof data === "object" &&
          data !== null &&
          "code" in data &&
          (data as { code: unknown }).code === "VALIDATION_ERROR" &&
          "errors" in data
        ) {
          const errors = (data as { errors: Record<string, unknown> }).errors;
          const normalized: Record<string, string> = {};

          Object.entries(errors).forEach(([key, value]) => {
            if (Array.isArray(value) && typeof value[0] === "string") {
              normalized[key] = value[0];
            }
          });

          setFieldErrors(normalized);
          return; 
        }
      }

      if (err instanceof AuthError) {
        setError(err.message);
        return;
      }

      setError("Registration failed. Please try again.");
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold">Register</h2>

      {error && <AutoCloseMessage message={error} type="error" />}
      {success && <AutoCloseMessage message={success} type="success" />}

      <Input
        name="name"
        label="Name"
        required
        value={formValues.name}
        onChange={handleChange}
        error={fieldErrors.name} 
      />

      <Input
        name="email"
        label="Email address"
        type="email"
        required
        value={formValues.email}
        onChange={handleChange}
        error={fieldErrors.email} 
      />

      <Input
        name="phone"
        label="Phone Number"
        required
        value={formValues.phone}
        onChange={handleChange}
        error={fieldErrors.phone} 
      />

      <Button type="submit" disabled={!isFormValid || loading}>
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}

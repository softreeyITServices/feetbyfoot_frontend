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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: "customer",
    };

    try {
      const response = await authService.register(data);
      setSuccess(response.data?.message || "Registration successful!");
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-lg font-semibold">Register</h2>

      {error && <AutoCloseMessage message={error} type="error" />}
      {success && <AutoCloseMessage message={success} type="success" />}


      <Input name="name" label="Name" required />
      <Input name="email" label="Email address" required type="email" />
      <Input name="phone" label="Phone Number" required />

      <Button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </Button>
    </form>
  );
}
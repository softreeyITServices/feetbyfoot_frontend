"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { authService } from "@/domain/application/services/auth.service";

type AccountForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

type SessionUser = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export default function AccountPage() {
  const { data: session, status, update } = useSession();

  const [form, setForm] = useState<AccountForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);

  /* ---------------------------------------
     Initialize form once when session loads
  ---------------------------------------- */
  useEffect(() => {
    if (!session?.user) return;

    const user = session.user as SessionUser;

    const fullName = user.name || "";
    const nameParts = fullName.trim().split(" ").filter(Boolean);

    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const firstName =
      nameParts.length > 1
        ? nameParts.slice(0, -1).join(" ")
        : fullName;

    setForm({
      firstName,
      lastName,
      email: user.email || "",
      phoneNumber: user.phone || "",
    });
  }, [session]);

  /* ---------------------------------------
     Handlers
  ---------------------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fullUpdatedName =
        `${form.firstName} ${form.lastName}`.trim();

      const response = await authService.updateProfile({
        name: fullUpdatedName,
        email: form.email,
        phone: form.phoneNumber,
      });

      if (response.success) {
        toast.success(
          response.data?.message || "Profile updated successfully"
        );
        await update({
          name: fullUpdatedName,
          email: form.email,
          phone: form.phoneNumber,
        });
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="p-10">Loading...</div>;
  }

  const displayName =
    `${form.firstName} ${form.lastName}`.trim();

  return (
    <div className="px-4">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display name
              </label>
              <input
                type="text"
                value={displayName}
                readOnly
                className="w-full border border-gray-200 rounded-md px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">
                Automatically generated from your first and last name.
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
            </div>
          </section>

          <div className="border-t border-gray-200" />

          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium px-8 py-3 rounded-md transition"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

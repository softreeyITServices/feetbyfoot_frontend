"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type AccountForm = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function AccountPage() {
  const { data: session, status } = useSession();

  /* ---------------------------------------
     Track if user has manually edited fields
  ---------------------------------------- */
  const [hasEdited, setHasEdited] = useState(false);
  const [editedForm, setEditedForm] = useState<Partial<AccountForm>>({});

  /* ---------------------------------------
     Derive values from session (always fresh)
  ---------------------------------------- */
  const fullName = session?.user?.name || "";
  const nameParts = fullName.trim().split(" ").filter(Boolean);

  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : fullName;

  // Use edited values if available, otherwise use session data
  const form: AccountForm = {
    firstName: hasEdited && editedForm.firstName !== undefined ? editedForm.firstName : firstName,
    lastName: hasEdited && editedForm.lastName !== undefined ? editedForm.lastName : lastName,
    displayName: hasEdited && editedForm.displayName !== undefined ? editedForm.displayName : fullName,
    email: hasEdited && editedForm.email !== undefined ? editedForm.email : session?.user?.email || "",
    phoneNumber: hasEdited && editedForm.phoneNumber !== undefined ? editedForm.phoneNumber : (session?.user)?.phone || "",
    currentPassword: editedForm.currentPassword || "",
    newPassword: editedForm.newPassword || "",
    confirmPassword: editedForm.confirmPassword || "",
  };

  /* ---------------------------------------
     Handlers
  ---------------------------------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasEdited(true);
    setEditedForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert("Account details updated successfully (mock)");
  };

  if (status === "loading") {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="px-4">
      <div className="max-w-4xl mx-auto bg-white p-10">
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
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-400"
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
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display name *
              </label>
              <input
                type="text"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-400"
              />
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
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-400"
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
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </section>

          <div className="border-t border-gray-200" />

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Password change
            </h2>

            <div className="mb-6">
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Current password"
                className="w-full border border-gray-300 rounded-md px-4 py-3"
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="New password"
                className="w-full border border-gray-300 rounded-md px-4 py-3"
              />
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="w-full border border-gray-300 rounded-md px-4 py-3"
              />
            </div>
          </section>

          <div className="border-t border-gray-200" />

          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 py-3 rounded-md"
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}
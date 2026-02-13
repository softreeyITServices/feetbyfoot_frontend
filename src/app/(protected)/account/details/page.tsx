"use client";

import { useState } from "react";

export default function AccountPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    displayName: "6oxstkc39x",
    email: "6oxstkc39x@daouse.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", form);
  };

  return (
    <div className="px-4">
      <div className="max-w-4xl mx-auto bg-white p-10">
        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* PERSONAL INFORMATION */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Display Name */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display name *
              </label>
              <input
                type="text"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <p className="text-sm text-gray-500 mt-2">
                This will be how your name will be displayed in the account section and in reviews.
              </p>
            </div>

            {/* Email */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                disabled
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-4 py-3 text-gray-600 cursor-not-allowed"
              />
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* PASSWORD CHANGE */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Password change
            </h2>

            {/* Current Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current password (leave blank to leave unchanged)
              </label>
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* New Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New password (leave blank to leave unchanged)
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm new password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 py-3 rounded-md transition-all duration-200"
            >
              Save changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

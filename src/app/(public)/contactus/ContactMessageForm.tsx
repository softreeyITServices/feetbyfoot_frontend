"use client";

import { useState } from "react";
import { contactService } from "@/domain/application/services/contact.service";
import { CreateContactRequest } from "@/domain/shared/types/contact.type";

export default function ContactMessageForm() {
  const [formData, setFormData] = useState<CreateContactRequest>({
    fullName: "",
    email: "",
    phoneNumber: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.message) {
      setStatus("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("idle");

      await contactService.createContact(formData);

      setStatus("success");

      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        subject: "",
        message: "",
      });
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black p-10 rounded-md shadow-xl">
      <h3 className="text-2xl font-semibold text-yellow-400 mb-8">
        Send us a Message
      </h3>

      {status === "success" && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded">
          ✅ Your message has been sent successfully. We’ll contact you soon.
        </div>
      )}

      {status === "error" && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded">
          ❌ Something went wrong. Please check your inputs and try again.
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white text-sm">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="text-white text-sm">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-2 p-3 rounded bg-white text-black"
            />
          </div>
        </div>

        <div>
          <label className="text-white text-sm">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full mt-2 p-3 rounded bg-white text-black"
          />
        </div>

        <div>
          <label className="text-white text-sm">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full mt-2 p-3 rounded bg-white text-black"
          />
        </div>

        <div>
          <label className="text-white text-sm">Message *</label>
          <textarea
            rows={4}
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full mt-2 p-3 rounded bg-white text-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-semibold py-4 rounded hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Sending..." : "SEND MESSAGE"}
        </button>
      </form>
    </div>
  );
}

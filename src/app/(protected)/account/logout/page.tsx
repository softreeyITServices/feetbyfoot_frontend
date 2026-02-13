"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleConfirm = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-900 mb-4">
          Log Out
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-md mb-10">
          Are you sure you want to log out of your account?
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-6">
          <button
            onClick={handleConfirm}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-8 py-2 rounded-md transition-all duration-200 shadow-sm"
          >
            Confirm Logout
          </button>

          <button
            onClick={handleCancel}
            className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-8 py-2 rounded-md transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

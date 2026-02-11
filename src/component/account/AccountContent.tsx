"use client"
import { signOut, useSession } from "next-auth/react";

export default function AccountContent() {
  const { data: session } = useSession();
  const { name } = session?.user ?? {};

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault(); // ⛔ stop Link navigation
    await signOut({ callbackUrl: "/login" }); // clear NextAuth session
  };

  return (
    <section className="border rounded-md p-6">
      <p className="text-sm">
        Hello <strong>{name}</strong>{" "}
        <span className="text-gray-500">
          (not {name}?
          <a href="#" onClick={handleLogout} className="text-blue-600 ml-1">
            Log out
          </a>
          )
        </span>
      </p>

      <div className="mt-6 border-t pt-4 text-sm text-gray-600 leading-relaxed">
        <p>
          From your account dashboard you can view your recent orders,
          manage your shipping and billing addresses, and edit your
          password and account details.
        </p>
      </div>
    </section>
  );
}

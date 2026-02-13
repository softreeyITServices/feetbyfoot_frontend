"use client"
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session } = useSession();
  const { name } = session?.user ?? {};

  return (
    <section className="p-6">
      <p className="text-md">
        Hello <strong>{name}</strong>{" "}
        <span className="text-gray-500">
          (not {name}?
          <Link href="/account/logout" className="text-blue-600 ml-1">
            Log out
          </Link>
          )
        </span>
      </p>

      <div className="mt-6 border-t border-gray-200 pt-4 text-md text-gray-600 leading-relaxed">
        <p>
          From your account dashboard you can view your recent orders,
          manage your shipping and billing addresses, and edit your
          password and account details.
        </p>
      </div>
    </section>
  );
}

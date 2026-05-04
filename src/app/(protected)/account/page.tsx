"use client"
import { useLayout } from "@/domain/application/context/LayoutContext";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";

export default function AccountPage() {
  const { data: session } = useSession();
  const { name } = session?.user ?? {};
  const { setTitle, setSubtitle } = useLayout();

  useEffect(() => {
    setTitle('My Accounts');
    setSubtitle('View and manage your accounts.');
  }, []);

  return (
    <section className="pt-4 pb-6 sm:p-6">
      <p className="text-sm sm:text-md">
        Hello <strong>{name}</strong>{" "}
        <span className="text-gray-500">
          (not {name}?
          <Link href="/account/logout" className="text-blue-600 ml-1">
            Log out
          </Link>
          )
        </span>
      </p>

      <div className="mt-5 sm:mt-6 border-t border-gray-200 pt-4 text-sm sm:text-md text-gray-600 leading-relaxed">
        <p>
          From your account dashboard you can view your recent orders,
          manage your shipping and billing addresses, and edit your
          password and account details.
        </p>
      </div>
    </section>
  );
}

import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/app/services/auth/[...nextauth]/route";
import WishlistPageClient from "./WishlistPageClient";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role?.toLowerCase();

  if (role === "admin") {
    notFound();
  }

  return <WishlistPageClient />;
}

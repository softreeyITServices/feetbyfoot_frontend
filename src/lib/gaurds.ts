// lib/guards.ts

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function requireRole(role: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.user.role !== role) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
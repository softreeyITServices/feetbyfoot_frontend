"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OldCartRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.push("/shop"); // Redirect them to the shop page!
  }, [router]);
  return null;
}

// src/components/providers/Providers.tsx
"use client";

import { ReactNode } from "react";
import { SessionProvider } from "./SessionProvider";

export function MainProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
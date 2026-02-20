// context/LayoutContext.ts
'use client';
import { createContext, useContext } from 'react';

interface LayoutContextType {
  setTitle: (t: string) => void;
  setSubtitle: (s: string) => void;
  title: string;
  subtitle: string;
}

export const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}
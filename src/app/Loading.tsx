"use client";

import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: number;
  text?: string;
}

export default function Loader({
  size = 40,
  text = "Loading",
}: LoaderProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Loader2
        size={size}
        className="animate-spin text-blue-600"
        strokeWidth={2}
      />
      <span className="text-sm text-gray-500">{text}</span>
    </div>
  );
}

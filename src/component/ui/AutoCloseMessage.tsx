import { useEffect, useState } from "react";

export function AutoCloseMessage({
  message,
  type,
  duration = 3000,
}: {
  message: string;
  type: "error" | "success";
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(percent);
    }, 50);

    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration]);

  if (!visible) return null;

  const isError = type === "error";

  return (
    <div
      className={`relative overflow-hidden rounded-md px-4 py-3 text-sm font-medium
        ${isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}
      `}
    >
      {message}

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 transition-all
          ${isError ? "bg-red-500" : "bg-green-500"}
        `}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

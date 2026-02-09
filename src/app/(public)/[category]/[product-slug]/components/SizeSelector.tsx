"use client";

import { useState } from "react";

export default function SizeSelector({ sizes }: { sizes: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <p className="text-sm font-medium mb-2">SELECT SIZE</p>
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelected(size)}
            className={`border px-4 py-2 text-sm  ${
              selected === size
                ? "border-black"
                : "border-gray-300"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

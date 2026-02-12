"use client";

import { useState } from "react";

interface Size {
  _id?: string;
  size: string;
  quantity: number;
  isActive: boolean;
}

export default function SizeSelector({ sizes }: { sizes: Size[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <p className="text-sm font-medium mb-2">SELECT SIZE</p>

      <div className="flex flex-wrap gap-3">
        {sizes.map((item, index) => {
          const disabled = !item.isActive || item.quantity === 0;

          return (
            <button
              key={item._id || index}
              disabled={disabled}
              onClick={() => setSelected(item.size)}
              className={`border px-4 py-2 text-sm transition
                ${
                  selected === item.size
                    ? "border-black"
                    : "border-gray-300"
                }
                ${
                  disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:border-black"
                }
              `}
            >
              {item.size}
            </button>
          );
        })}
      </div>
    </div>
  );
}

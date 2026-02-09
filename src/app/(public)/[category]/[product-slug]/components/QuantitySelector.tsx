"use client";

import { useState } from "react";

export default function QuantitySelector() {
  const [qty, setQty] = useState(1);

  return (
    <div className="flex border border-gray-300 items-center mt-4 h-12">
      <button
        onClick={() => setQty(Math.max(1, qty - 1))}
        className="px-3 py-2"
      >
        -
      </button>
      <span className="px-4 py-2">{qty}</span>
      <button
        onClick={() => setQty(qty + 1)}
        className="px-3 py-2"
      >
        +
      </button>
    </div>
  );
}

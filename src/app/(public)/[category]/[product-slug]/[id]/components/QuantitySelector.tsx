"use client";

interface QuantitySelectorProps {
  quantity: number;
  onChangeQuantity: (qty: number) => void;
}

export default function QuantitySelector({
  quantity,
  onChangeQuantity,
}: QuantitySelectorProps) {
  const increase = () => {
    onChangeQuantity(quantity + 1);
  };

  const decrease = () => {
    onChangeQuantity(Math.max(1, quantity - 1));
  };

  return (
    <div className="flex border border-gray-300 items-center h-12">
      <button onClick={decrease} className="px-3 py-2">
        -
      </button>

      <span className="px-4 py-2">{quantity}</span>

      <button onClick={increase} className="px-3 py-2">
        +
      </button>
    </div>
  );
}

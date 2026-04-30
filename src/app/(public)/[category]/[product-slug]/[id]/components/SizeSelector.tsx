"use client";

interface Size {
  _id?: string;
  size: string;
  color?: string;
  quantity: number;
  isActive: boolean;
}

interface SizeSelectorProps {
  sizes: Size[];
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
}: SizeSelectorProps) {
  console.log("[SizeSelector] sizes prop received:", sizes, "type:", typeof sizes, "isArray:", Array.isArray(sizes));

  return (
    <div>
      <p className="text-sm font-medium mb-2">SELECT SIZE</p>

      <div className="flex flex-wrap gap-3">
        {(sizes ?? []).map((item, index) => {
          const disabled = !item.isActive || item.quantity <= 0;

          return (
            <div key={item._id || index} className="flex flex-col items-center gap-0.5">
              <button
                disabled={disabled}
                onClick={() => onSelectSize(item.size)}
                className={`border px-4 py-2 text-sm transition
                  ${
                    selectedSize === item.size
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-800"
                  }
                  ${
                    disabled
                      ? "opacity-40 cursor-not-allowed line-through"
                      : "hover:border-black"
                  }
                `}
              >
                {item.size}
              </button>
              {disabled && (
                <span className="text-[10px] text-red-400">Out of stock</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

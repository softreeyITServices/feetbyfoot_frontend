// components/ui/SortDropdown.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Dropdown from "@/component/ui/Dropdown";

const SORT_OPTIONS = [
  { label: "Latest", value: "default" },
  { label: "Price: Low to High", value: "price_low_high" },
  { label: "Price: High to Low", value: "price_high_low" },
  { label: "Discount", value: "discount" },
  { label: "Rating", value: "rating" },
];

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSorting = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Dropdown
      label=""
      options={SORT_OPTIONS}
      onChange={handleSorting}
    />
  );
}
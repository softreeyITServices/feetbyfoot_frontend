"use client";

import { useState } from "react";
import ProductReviewTab from "./tabs/ProductReviewTab";
import ProductDeliveryTab from "./tabs/ProductDeliveryTab";
import ProductDescriptionTab from "./tabs/ProductDescriptionTab";

export default function ProductTabs() {
  const [tab, setTab] = useState("description");

  return (
    <section className="mt-16">
      <div className="flex gap-8 mb-6 justify-center">
        {["description", "delivery", "reviews"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 ${
              tab === t
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500"
            }`}
          >
            {t === "description"
              ? "Description"
              : t === "delivery"
              ? "Delivery & Returns"
              : "Reviews (0)"}
          </button>
        ))}
      </div>

      <div className=" shadow-xl rounded-lg p-8 text-sm text-gray-700">
        {tab === "description" && <ProductDescriptionTab />}

        {tab === "delivery" && <ProductDeliveryTab />}

        {tab === "reviews" && <ProductReviewTab />}
      </div>
    </section>
  );
}

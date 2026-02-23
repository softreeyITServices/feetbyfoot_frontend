"use client";

import { useState, useEffect } from "react";
import ProductReviewTab from "./tabs/ProductReviewTab";
import ProductDeliveryTab from "./tabs/ProductDeliveryTab";
import ProductDescriptionTab from "./tabs/ProductDescriptionTab";
import { Review } from "@/domain/shared/types/rating.type";

interface Props {
  description: string;
  reviews: Review[];
  totalRatings: number;
  averageRating: number;
}

export default function ProductTabs({
  description,
  reviews,
  totalRatings,
  averageRating,
}: Props) {
  const [tab, setTab] = useState("description");

  // 🔥 Sync tab with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#reviews") {
        setTab("reviews");

        setTimeout(() => {
          document
            .getElementById("reviews-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

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
              : `Reviews (${totalRatings})`}
          </button>
        ))}
      </div>

      <div className="shadow-xl rounded-lg p-8 text-sm text-gray-700">
        {tab === "description" && (
          <ProductDescriptionTab description={description} />
        )}

        {tab === "delivery" && <ProductDeliveryTab />}

        {tab === "reviews" && (
          <ProductReviewTab
            reviews={reviews}
            totalRatings={totalRatings}
            averageRating={averageRating}
          />
        )}
      </div>
    </section>
  );
}
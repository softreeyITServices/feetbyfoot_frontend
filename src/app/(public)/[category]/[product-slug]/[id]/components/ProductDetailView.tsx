"use client";

import { useState } from "react";
import ProductGallery from "./ProductGallery";
import ProductSummary from "./ProductSummary";
import { Review } from "@/domain/shared/types/rating.type";
import { ProductColorDetail } from "@/domain/shared/types/product.type";

interface ProductDetailViewProps {
  product: any;
  totalRatings: number;
  averageRating: number;
  reviews: Review[];
}

export default function ProductDetailView({
  product,
  totalRatings,
  averageRating,
  reviews,
}: ProductDetailViewProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Determine the active color details from the sizes array
  // Find the first size for the selected color that has details (title, description, or images)
  const activeColorDetail = selectedColor 
    ? product.sizes?.find((s: any) => s.color === selectedColor && (s.title || s.description || (s.imageUrls && s.imageUrls.length > 0)))
      || product.sizes?.find((s: any) => s.color === selectedColor)
    : null;

  // Determine images to show
  const activeImages = activeColorDetail && activeColorDetail.imageUrls && activeColorDetail.imageUrls.length > 0
    ? activeColorDetail.imageUrls
    : product.images;

  // Determine title and description to show
  const activeTitle = activeColorDetail?.title || product.name;
  const activeDescription = activeColorDetail?.description || product.description;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <ProductGallery images={activeImages} />
      <ProductSummary
        product={{ ...product, name: activeTitle, description: activeDescription }}
        totalRatings={totalRatings}
        averageRating={averageRating}
        reviews={reviews}
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
      />
    </section>
  );
}

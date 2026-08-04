"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatImageUrl } from "@/lib/imageUrlFormatter";

export default function ProductGallery({
  images,
}: {
  images: string[];
}) {
  const formattedImages = images.map((img) => formatImageUrl(img));
  const [mainImage, setMainImage] = useState(formattedImages[0] || "");

  useEffect(() => {
    setMainImage(formattedImages[0] || "");
  }, [images]);

  if (!formattedImages.length) return null;

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="flex flex-col gap-3">
        {formattedImages.map((img) => (
          <div
            key={img}
            onClick={() => setMainImage(img)}
            className={`relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition ${
              mainImage === img ? "border-black" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={img}
              fill
              alt="Thumbnail"
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Main Image */}
      <div className="group flex-1 rounded-lg overflow-hidden bg-gray-50 aspect-square relative">
        <Image
          src={mainImage}
          fill
          alt="Product image"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-125"
          priority
          unoptimized
        />
      </div>
    </div>
  );
}

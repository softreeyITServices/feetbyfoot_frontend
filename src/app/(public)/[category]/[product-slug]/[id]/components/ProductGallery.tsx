"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProductGallery({
  images,
}: {
  images: string[];
}) {
  const [mainImage, setMainImage] = useState(images[0] || "");

  useEffect(() => {
    setMainImage(images[0] || "");
  }, [images]);

  if (!images.length) return null;

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="flex flex-col gap-3">
        {images.map((img) => (
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
            />
          </div>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 rounded-lg overflow-hidden bg-gray-50 aspect-square relative">
        <Image
          src={mainImage}
          fill
          alt="Product image"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}

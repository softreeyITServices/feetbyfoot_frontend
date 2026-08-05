"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatImageUrl } from "@/lib/imageUrlFormatter";
import { Maximize2, X } from "lucide-react";

export default function ProductGallery({
  images,
}: {
  images: string[];
}) {
  const formattedImages = images.map((img) => formatImageUrl(img));
  const [mainImage, setMainImage] = useState(formattedImages[0] || "");
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setMainImage(formattedImages[0] || "");
  }, [images]);

  if (!formattedImages.length) return null;

  const activeIndex = formattedImages.indexOf(mainImage);

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-5 w-full">
        {/* Thumbnails list */}
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[600px] py-1 px-1 scrollbar-none">
          {formattedImages.map((img, index) => {
            const isActive = mainImage === img;
            return (
              <button
                key={img + index}
                type="button"
                onClick={() => setMainImage(img)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 bg-white ${
                  isActive
                    ? "ring-2 ring-black ring-offset-2 scale-105 shadow-md"
                    : "opacity-75 hover:opacity-100 hover:scale-102 border border-gray-200"
                }`}
              >
                <Image
                  src={img}
                  fill
                  alt={`Thumbnail ${index + 1}`}
                  className="object-contain p-1.5"
                  unoptimized
                />
              </button>
            );
          })}
        </div>

        {/* Main Image Frame */}
        <div className="group flex-1 rounded-2xl overflow-hidden bg-gradient-to-b from-neutral-50 to-neutral-100 border border-gray-100 shadow-sm aspect-[4/5] min-h-[420px] sm:min-h-[540px] md:min-h-[600px] relative flex items-center justify-center">
          {/* Image Counter Badge */}
          {formattedImages.length > 1 && (
            <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full tracking-wide">
              {activeIndex + 1} / {formattedImages.length}
            </div>
          )}

          {/* Expand / Zoom Icon Button */}
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            aria-label="Expand image"
            className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <Maximize2 size={16} />
          </button>

          {/* Product Image */}
          <Image
            src={mainImage}
            fill
            alt="Product image"
            className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105 cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
          onClick={() => setIsZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            aria-label="Close preview"
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-transform duration-200 hover:scale-110"
          >
            <X size={24} />
          </button>

          <div
            className="relative w-full max-w-4xl max-h-[85vh] aspect-square bg-white/5 rounded-2xl p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={mainImage}
              fill
              alt="Zoomed product view"
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}

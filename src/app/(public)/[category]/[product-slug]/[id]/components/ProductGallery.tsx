import Image from "next/image";
import { getSafeImageUrls } from "@/lib/imageUrl";

export default function ProductGallery({
  images,
}: {
  images: string[];
}) {
  const safeImages = getSafeImageUrls(images);

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="flex flex-col gap-3">
        {safeImages.map((img, index) => (
          <Image
            key={`${img}-${index}`}
            src={img}
            width={80}
            height={80}
            alt=""
            className="w-20 h-20 rounded-md object-cover cursor-pointer"
          />
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 rounded-lg overflow-hidden">
        <Image
          src={safeImages[0]}
          width={400}
          height={400}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

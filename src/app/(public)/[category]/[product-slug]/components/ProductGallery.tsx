import Image from "next/image";

export default function ProductGallery({
  images,
}: {
  images: string[];
}) {
  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="flex flex-col gap-3">
        {images.map((img) => (
          <Image
            key={img}
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
          src={images[0]}
          width={400}
          height={400}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

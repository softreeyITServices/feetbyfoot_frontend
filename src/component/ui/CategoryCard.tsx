import { UpRightArrowIcon } from "@/icons/UpRightArrowIcon";
import { CategoryItem } from "@/domain/shared/types/category";
import Image from "next/image";
import { getSafeImageUrl } from "@/lib/imageUrl";


export default function CategoryCard({ label, image, href }: CategoryItem) {
  return (
    <a href={href} className="flex-1 relative group overflow-hidden rounded-2xl">
      <Image
        src={getSafeImageUrl(image)}
        alt={label}
        width={600}
        height={400}
        className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay label */}
      <span className="absolute top-4 left-4 bg-yellow-400 px-4 py-2 rounded-md font-semibold flex items-center gap-2 text-black transition-all duration-300 group-hover:bg-yellow-300">
        <span className="text-lg">{label}</span> <UpRightArrowIcon width={24} height={24} />
      </span>

      {/* Subtle bottom gradient for modern UI */}
      <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </a>
  );
}

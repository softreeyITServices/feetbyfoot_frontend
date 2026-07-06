import { CategoryItem } from "@/domain/shared/types/category";
import Image from "next/image";
import Link from "next/link";

export default function CategoryCard({ label, image, href }: CategoryItem) {
  return (
    <Link 
      href={href} 
      className="flex-1 relative group overflow-hidden rounded-xl sm:rounded-2xl min-h-[120px] sm:min-h-[150px]"
    >
      <Image
        src={image}
        alt={label}
        width={600}
        height={400}
        className="w-full h-full object-cover rounded-xl sm:rounded-2xl transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
      />

      {/* Overlay label - responsive sizing */}
      <span className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-yellow-400 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-1.5 md:py-2 rounded-md font-semibold flex items-center gap-1.5 sm:gap-2 text-black transition-all duration-300 group-hover:bg-yellow-300">
        <span className="text-xs sm:text-sm md:text-base lg:text-lg line-clamp-1">
          {label}
        </span>
      </span>

      {/* Subtle bottom gradient for modern UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity rounded-xl sm:rounded-2xl" />
    </Link>
  );
}
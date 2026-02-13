"use client"
import { CartBasketIcon } from '@/icons/CartBasketIcon';
import Link from 'next/link';
import Image from 'next/image'
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cart.slice';
import { toSlug } from '@/lib/slugConverter';
import { openCart } from '@/store/slices/ui.slice';
import SizeSelector from '@/app/(public)/[category]/[product-slug]/[id]/components/SizeSelector';
import { useState } from 'react';

function ProductCard({ id, imageSrc, altText, categories, title, originalPrice, discountedPrice, size, home }: {
  home?: boolean;
  id: string;
  imageSrc: string;
  size: {
    _id?: string;
    size: string;
    quantity: number;
    isActive: boolean;
  }[];
  altText: string;
  categories: string;
  title: string;
  originalPrice: string;
  discountedPrice: string;
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();

  const handleSize = (e: string) => {
    setSelectedSize(e)
    setError("")
  }

  const handleCart = () => {
    if (!selectedSize) {
      setError("Size not selected")
      return
    }
    dispatch(
      addToCart({
        id,
        name: title,
        price: discountedPrice,
        image: imageSrc,
        size: selectedSize,
        quantity: 1,
      })
    );
    setSelectedSize('')
    dispatch(openCart());
  }
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-3">
      <div className={`${home ? '' : 'w-66.25 h-66.25'}`}>
        <Image
          src={imageSrc}
          alt={altText}
          width={400}
          height={450}
          className="w-full object-cover"
        />
      </div>

      <div className="p-0 pt-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          {categories}
        </p>

        <Link href={`/${toSlug(categories)}/${toSlug(title)}/${id}`} className="no-underline hover:underline text-black" title={title}>
          <h3 className="font-semibold text-sm mt-2 truncate">
            {title}
          </h3>
        </Link>

        <div className="mt-3">
          <span className="line-through text-gray-400 text-sm">₹{originalPrice}</span>
          <span className="text-green-600 font-bold text-lg ml-2">₹{discountedPrice}</span>
        </div>

        <SizeSelector
          sizes={size}
          selectedSize={selectedSize}
          onSelectSize={handleSize}
        />
        <span className='text-red-500 text-sm'>{error}</span>
        <button className="mt-4 w-full bg-black text-white py-2 hover:bg-gray-800 flex items-center justify-evenly gap-2" onClick={handleCart}>
          <CartBasketIcon width={13} height={15} fill='#fff' /> <span> ADD TO BASKET</span>
        </button>
      </div>
    </div>
  )
}

export default ProductCard
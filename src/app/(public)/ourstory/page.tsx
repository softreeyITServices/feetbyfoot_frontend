import { PlusIcon } from "@/icons/PlusIcon";
import { LoveIcon } from "@/icons/LoveIcon";
import { MaterialIcon } from "@/icons/MaterialIcon";
import React from "react";


import Image from "next/image";
import { StarIcon } from "@/icons/StarIcon";

export default function OurStoryPage() {
  return (
    <>
      <main className="bg-white">
        {/* ================= HERO ================= */}
        <section className="pt-12">
          <div className="mx-auto max-w-282.25 px-4 text-center">
            <div className="w-full flex justify-center">
              {/* <div className="inline-flex items-center justify-center bg-[#FFD600] px-8 h-[66px]"> */}
              <h1 className="inline-block bg-yellow-400 px-40 py-2 text-4xl font-bold">
                Our Story
              </h1>
              {/* </div> */}
            </div>

            <p className="mt-2 text-xs text-gray-600">
              Founded now to receive exclusive deals & gifts
            </p>

            <div className="mt-8 overflow-hidden rounded-2xl">
              <Image
                src="/assets/images/mens-category-banner.png"
                alt="Our Story Hero"
                width={1129}
                height={420}
                className="w-full object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* ================= MORE THAN JUST BASICS ================= */}
        <section className="py-16">
          <div className="mx-auto max-w-282.25 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
              {/* LEFT */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  More Than Just Basics
                </h2>

                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  every pair of socks is a canvas. Collaborating with graphic designers,
                  illustrators, street artists, and creators from across visual universes,
                  we turn bold imagination into wearable art. These aren&apos;t just socks — they&apos;re expressions of creativity,
                  crafted to bring color, story, and originality to every step you take.
                </p>

                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                  But we don&apos;t stop at socks. Our collection extends to everyday essentials that deserve the same artistic attention — from comfortable underwear that feels as good as it looks,
                  to scarves that add a splash of personality to any outfit.
                  We believe that what you wear closest to your skin should inspire confidence and joy.
                </p>

                <h2 className="text-base font-semibold text-gray-900 mb-6">
                  Our Mission
                </h2>

                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                  We&apos;re on a mission to transform the mundane into the extraordinary. Every product we create is designed with comfort, quality, and creativity at its core. Whether
                  you&apos;re shopping for yourself or searching for the perfect gift, we offer pieces that celebrate individuality and craftsmanship.
                </p>

                <div className="grid grid-cols-3 gap-6">
                  <MissionItem title="Quality First" subtitle="Premium materials for lasting comfort" />
                  <MissionItem title="Unique Designs" subtitle="Artist collaborations you won't find anywhere else" />
                  <MissionItem title="Made with Care" subtitle="Ethically produced with attention to detail" />
                </div>
              </div>

              {/* RIGHT IMAGES */}
              <div className="flex flex-col gap-6">
                <div className="overflow-hidden rounded-2xl">
                  <Image
                    src="/assets/images/socks-1.png"
                    alt="Socks by fireplace"
                    width={590}
                    height={320}
                  // className="w-full h-[220px] object-cover"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl">
                  <Image
                    src="/assets/images/fallbackImage.png"
                    alt="Winter lifestyle"
                    width={590}
                    height={320}
                  // className="w-full h-[220px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SHOP BY CATEGORY ================= */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-282.25 px-4 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Shop by Category
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Explore our curated collections for everyone.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <CategoryCard
                title="MEN’S"
                items={[
                  "Athletic Socks",
                  "Casual Socks",
                  "Winter Socks",
                ]}
              />
              <CategoryCard
                title="WOMEN’S"
                items={[
                  "Cozy Essentials",
                  "Trendy Styles",
                  "Soft Materials",
                ]}
              />
              <CategoryCard
                title="KIDS"
                items={[
                  "Playful Designs",
                  "Warm Fit",
                  "All-Day Comfort",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ================= WHY CHOOSE ================= */}
        <section className="py-16">
          <div className="mx-auto max-w-282.25 px-4 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-10">
              Why Choose Feet by Foot?
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <WhyItem title="Artist Collaborations" subtitle="Each design is created in partnership with talented artists worldwide" />
              <WhyItem title="Premium Materials" subtitle="Soft, breathable fabrics that last and feel incredible" />
              <WhyItem title="Sustainable Practices" subtitle="Ethical production with minimal environmental impact" />
              <WhyItem title="Perfect Gifting" subtitle="Beautifully packaged and ready to delight" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

/* ================= SMALL COMPONENTS ================= */

function MissionItem({ title, subtitle }: { title: string, subtitle: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    "Quality First": <PlusIcon className="h-4 w-4" />,
    "Unique Designs": <StarIcon className="h-4 w-4" />,
    "Made with Care": <LoveIcon className="h-4 w-4" />,
  };

  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="h-10 w-10 rounded-full bg-[#F8CE1E] flex items-center justify-center text-black">
        {iconMap[title]}
      </div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500 leading-snug max-w-45">
        {subtitle}
      </p>
    </div>
  );
}


function CategoryCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function WhyItem({ title, subtitle }: { title: string, subtitle: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    "Artist Collaborations": <Image src="/assets/images/color.png" alt="Artist Collab Icon" width={48} height={48} />,
    "Premium Materials": <Image src="/assets/images/star.png" alt="Artist Collab Icon" width={48} height={48} />,
    "Sustainable Practices": <Image src="/assets/images/earth.png" alt="Artist Collab Icon" width={48} height={48} />,
    "Perfect Gifting": <Image src="/assets/images/gift.png" alt="Artist Collab Icon" width={48} height={48} />,
  };

  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="h-10 w-10 rounded-full flex items-center justify-center text-gray-900">
        {iconMap[title]}
      </div>
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 leading-snug max-w-45">
        {subtitle}
      </p>
    </div>
  );
}
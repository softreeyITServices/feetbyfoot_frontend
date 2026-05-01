import { PlusIcon } from "@/icons/PlusIcon";
import { LoveIcon } from "@/icons/LoveIcon";
import { StarIcon } from "@/icons/StarIcon";
import { SectionBannerService } from "@/domain/application/services/admin/sectionBanner.service";
import Image from "next/image";
import React from "react";

export default async function BrandPage() {
  let bannerUrl: string | null = null;

  try {
    const banners = await SectionBannerService.getBySectionKey("BRAND");
    bannerUrl = banners.find((banner) => banner.isActive)?.image ?? null;
  } catch {
    // Silently fall back to no banner image
  }

  return (
    <>
      <main className="bg-white">

        {/* ================= HERO ================= */}
        <section className="pt-12">
          <div className="max-w-full px-4 text-center">
            <div className="w-full flex justify-center">
              <h1 className="inline-block bg-yellow-400 px-40 py-2 text-4xl font-bold">
                Our Story
              </h1>
            </div>

            <p className="mt-2 text-xs text-gray-600">
              Crafted with purpose. Worn with pride.
            </p>

            {bannerUrl && (
              <div className="mt-8 overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bannerUrl}
                  alt="Brand hero"
                  className="w-full object-cover max-h-[420px]"
                />
              </div>
            )}
          </div>
        </section>

        {/* ================= MORE THAN JUST BASICS ================= */}
        <section className="py-16">
          <div className="mx-auto max-w-[1129px] px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

              {/* LEFT */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  More Than Just Basics
                </h2>

                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  Every pair of socks is a canvas. Collaborating with graphic designers,
                  illustrators, street artists, and creators from across visual universes,
                  we turn bold imagination into wearable art. These aren&apos;t just socks — they&apos;re
                  expressions of creativity, crafted to bring color, story, and originality
                  to every step you take.
                </p>

                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                  But we don&apos;t stop at socks. Our collection extends to everyday essentials
                  that deserve the same artistic attention — from comfortable underwear that
                  feels as good as it looks, to scarves that add a splash of personality to
                  any outfit. We believe that what you wear closest to your skin should
                  inspire confidence and joy.
                </p>

                <h2 className="text-base font-semibold text-gray-900 mb-6">
                  Our Mission
                </h2>

                <p className="text-sm text-gray-700 leading-relaxed mb-6">
                  We&apos;re on a mission to transform the mundane into the extraordinary. Every
                  product we create is designed with comfort, quality, and creativity at its
                  core. Whether you&apos;re shopping for yourself or searching for the perfect gift,
                  we offer pieces that celebrate individuality and craftsmanship.
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
                    className="w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <Image
                    src="/assets/images/fallbackImage.png"
                    alt="Winter lifestyle"
                    width={590}
                    height={320}
                    className="w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SHOP BY CATEGORY ================= */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-[1129px] px-4 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Shop by Category
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Explore our curated collections for everyone.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <CategoryCard
                title="MEN'S"
                description="Bold designs for the modern man. From statement socks to everyday essentials."
                items={["Athletic & Casual Socks", "Premium Underwear", "Winter Scarves"]}
              />
              <CategoryCard
                title="WOMEN'S"
                description="Elegant comfort meets artistic flair. Designed for those who appreciate detail."
                items={["Fashion & Comfort Socks", "Everyday Essentials", "Stylish Accessories"]}
              />
              <CategoryCard
                title="KIDS"
                description="Fun, colorful, and comfortable. Perfect for little adventurers."
                items={["Playful Patterns", "Soft & Durable", "Character Designs"]}
              />
            </div>
          </div>
        </section>

        {/* ================= WHY CHOOSE ================= */}
        <section className="py-16">
          <div className="mx-auto max-w-[1129px] px-4 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-10">
              Why Choose Feet by Foot?
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <WhyItem
                title="Artist Collaborations"
                subtitle="Each design is created in partnership with talented artists worldwide"
                icon="/assets/images/color.png"
              />
              <WhyItem
                title="Premium Materials"
                subtitle="Soft, breathable fabrics that last and feel incredible"
                icon="/assets/images/star.png"
              />
              <WhyItem
                title="Sustainable Practices"
                subtitle="Ethical production with minimal environmental impact"
                icon="/assets/images/earth.png"
              />
              <WhyItem
                title="Perfect Gifting"
                subtitle="Beautifully packaged and ready to delight"
                icon="/assets/images/gift.png"
              />
            </div>
          </div>
        </section>

      </main>
    </>
  );
}

/* ================= SMALL COMPONENTS ================= */

function MissionItem({ title, subtitle }: { title: string; subtitle: string }) {
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
      <p className="text-xs text-gray-500 leading-snug">{subtitle}</p>
    </div>
  );
}

function CategoryCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">{description}</p>
      <ul className="space-y-2 text-sm text-gray-700">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function WhyItem({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="h-12 w-12 flex items-center justify-center">
        <Image src={icon} alt={title} width={48} height={48} />
      </div>
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 leading-snug">{subtitle}</p>
    </div>
  );
}

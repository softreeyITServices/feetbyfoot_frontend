import { AwardIcon } from "@/icons/AwardIcon";
import { CustomerIcon } from "@/icons/CustomerIcon";
import { ExperienceIcon } from "@/icons/ExperienceIcon";
import Image from "next/image";
import Link from "next/link";

export default function WorkOfArtStatic() {
  return (
    <div className="w-full min-w-0">
      <header className="text-center">
        <h1 className="text-[22px] font-semibold leading-tight text-emerald-700">
          <span className="block">Works of art</span>
          <span className="block">at the end of the feet</span>
        </h1>

        <p className="mx-auto mt-3 max-w-195 whitespace-pre-line text-[11px] leading-relaxed text-neutral-600">
          FeetByFoot is a fresh and dynamic brand dedicated to redefining
          comfort and style for your feet. Specializing in premium-quality
          socks and fashionable footwear, we blend innovation with
          functionality to deliver products that support your lifestyle—
          whether you&apos;re on the move or at ease. Our designs focus on
          performance, aesthetics, and everyday comfort, making FeetByFoot
          your go-to choice for stepping out in confidence.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ImageBlock src="/assets/images/socks-art-main.png" />

        <div>
          <h2 className="text-[13px] font-semibold leading-snug text-emerald-700">
            <span className="block">Designed by Artists.</span>
            <span className="block">Worn by Originals.</span>
          </h2>

          <p className="mt-2 whitespace-pre-line text-[10.5px] leading-relaxed text-neutral-600">
            At Feet by Foot, every pair of socks is a canvas. Collaborating with
            graphic designers, illustrators, street artists, and creators from
            across visual universes, we turn bold imagination into wearable
            art. These aren’t just socks — they’re expressions of creativity,
            crafted to bring color, story, and originality to every step you
            take.
          </p>

          <Link
            href="/shop"
            className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-700 hover:opacity-80"
          >
            SHOP NOW →
          </Link>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-3 text-center">
        <Stat value="3,000 +" label="Sales on First Month" />
        <Stat value="1,000 +" label="Web Pages Created by Users" />
        <Stat value="500K +" label="Customers Served Around The World" />
      </section>

      <section className="mt-6">
        <ImageBlock src="/assets/images/socks-art-main.png" />
      </section>

      <section className="mt-10">
        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          <IconStat
            icon={<CustomerIcon className="h-9 w-9 text-emerald-700" />}
            title="47,000+ HAPPY CUSTOMER"
            desc={`Thousands have already discovered the\nperfect blend of comfort, style, and creativity\n— join the movement!`}
          />

          <IconStat
            icon={<AwardIcon className="h-9 w-9 text-emerald-700" />}
            title="10+ AWARDS WON"
            desc="Recognized for innovation, design, and quality across the sock universe."
          />

          <IconStat
            icon={<ExperienceIcon className="h-9 w-9 text-emerald-700" />}
            title="12 YEARS OF EXPERIENCES"
            desc="Proudly crafting comfort for over 12 years — experience you can feel in every step."
          />
        </div>
      </section>

      <section className="mt-10 pb-10">
        <div className="relative mx-auto hidden max-w-245 md:block">
          <div className="relative h-65">
            <div className="absolute left-30 top-2.5 w-65 overflow-hidden">
              <Image
                src="/assets/images/socks-art-2.png"
                alt=""
                width={1200}
                height={800}
                className="h-auto w-full object-cover"
              />
            </div>

            <div className="absolute left-1/2 top-22 w-85 -translate-x-1/2 text-center">
              <p className="text-[13px] leading-relaxed text-emerald-700">
                “Socks tends to consume everything else, it has become one’s
                entire life.”
              </p>

              <div className="mx-auto mt-3 h-0.5 w-19.5 bg-emerald-500" />

              <p className="mt-3 text-[8px] font-semibold tracking-[0.35em] text-neutral-400">
                SOCKS DESIGNER
              </p>
            </div>

            <div className="absolute right-42.5 bottom-0 w-75 overflow-hidden">
              <Image
                src="/assets/images/quote-left.png"
                alt=""
                width={1200}
                height={800}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ImageBlock({ src }: { src: string }) {
  return (
    <div className="overflow-hidden">
      <Image
        src={src}
        alt=""
        width={1600}
        height={1000}
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[14px] font-semibold text-emerald-700">{value}</div>
      <div className="mt-1 text-[9.5px] text-neutral-500">{label}</div>
    </div>
  );
}

function IconStat({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="mx-auto max-w-70">
      <div className="mx-auto flex h-10 w-10 items-center justify-center">
        {icon}
      </div>

      <div className="mt-2 text-[9px] font-semibold tracking-[0.18em] text-emerald-700">
        {title}
      </div>

      <p className="mt-2 whitespace-pre-line text-[10px] leading-relaxed text-neutral-500">
        {desc}
      </p>
    </div>
  );
}

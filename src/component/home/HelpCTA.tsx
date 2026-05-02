import Image from "next/image";
import Container from "../ui/Container";
import { OpenEnvelopeIcon } from "@/icons/OpenEnvelopeIcon";
import { ChatPhoneIcon } from "@/icons/ChatPhoneIcon";
import FadeIn from "../ui/FadeIn";

export default function HelpCTA() {
  return (
    <Container>
      <section className="w-full px-0 sm:px-4 py-6 sm:py-8 md:py-10">
        <div className="mx-auto max-w-7xl bg-[#F8D317] rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-14 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 md:gap-10 lg:gap-16">

          {/* LEFT CONTENT */}
          <FadeIn direction="left" className="w-full md:flex-1 text-center md:text-left">
            <p className="text-[10px] sm:text-xs md:text-sm lg:text-lg font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-black/80 mb-2 sm:mb-3">
              WE&apos;RE HERE FOR YOU
            </p>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#0A5C4A] leading-tight mb-3 sm:mb-4">
              Have Questions?
              <br />
              Get In Touch!
            </h2>

            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-medium sm:font-semibold text-black/90 mb-5 sm:mb-6 md:mb-8">
              One quick call and you look wonderful!
            </p>

            {/* CONTACT BUTTONS - 2 columns on mobile, stack on tablet, row on desktop */}
            <div className="flex flex-col md:flex-col gap-2 sm:gap-3 w-full md:w-fit">
              {/* Mobile: 2 buttons side by side */}
              <div className="flex md:hidden gap-2 sm:gap-3">
                <a
                  href="mailto:info@feetbyfoot.com"
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-black text-[#F8D317] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-gray-900 transition-colors"
                >
                  <OpenEnvelopeIcon width={16} height={16} className="sm:w-[18px] sm:h-[18px]" fill="#F8D317" />
                  <span className="truncate">Email Us</span>
                </a>

                <a
                  href="tel:+919896454666"
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-black text-[#F8D317] px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-gray-900 transition-colors"
                >
                  <ChatPhoneIcon width={16} height={16} className="sm:w-[18px] sm:h-[18px]" fill="#F8D317" />
                  <span>Call Us</span>
                </a>
              </div>

              {/* Tablet/Desktop: Full width buttons with full text */}
              <a
                href="mailto:info@feetbyfoot.com"
                className="hidden md:flex items-center gap-3 bg-black text-[#F8D317] px-5 py-2.5 rounded-lg text-sm lg:text-base font-semibold w-full md:w-fit hover:bg-gray-900 transition-colors"
              >
                <span className="p-1">
                  <OpenEnvelopeIcon width={24} height={24} fill="#F8D317" />
                </span>
                info@feetbyfoot.com
              </a>

              <a
                href="tel:+919896454666"
                className="hidden md:flex items-center gap-3 bg-black text-[#F8D317] px-5 py-2.5 rounded-lg text-sm lg:text-base font-semibold w-full md:w-fit hover:bg-gray-900 transition-colors"
              >
                <span className="p-1">
                  <ChatPhoneIcon width={24} height={24} fill="#F8D317" />
                </span>
                +91-9896454666
              </a>
            </div>
          </FadeIn>

          {/* RIGHT IMAGE */}
          <FadeIn direction="right" delay={150} className="relative w-[180px] h-[180px] xs:w-[200px] xs:h-[200px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] xl:w-[360px] xl:h-[360px] rounded-full overflow-hidden flex-shrink-0 mt-2 sm:mt-3 md:mt-0">
            <Image
              src="/assets/images/home1_img-15.jpg"
              alt="Customer support"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
              sizes="(max-width: 475px) 180px, (max-width: 640px) 200px, (max-width: 768px) 240px, (max-width: 1024px) 280px, (max-width: 1280px) 320px, 360px"
            />
          </FadeIn>

        </div>
      </section>
    </Container>
  );
}
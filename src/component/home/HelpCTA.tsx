import Image from "next/image";
import Container from "../ui/Container";
import { OpenEnvelopeIcon } from "@/icons/OpenEnvelopeIcon";
import { ChatPhoneIcon } from "@/icons/ChatPhoneIcon";

export default function HelpCTA() {
  return (
    <Container>
      <section className="w-full px-4 py-10">
        <div className="mx-auto max-w-7xl bg-[#F8D317] rounded-3xl px-10 py-14 flex items-center justify-between gap-10">

          {/* LEFT CONTENT */}
          <div className="max-w-xl">
            <p className="text-lg font-semibold tracking-widest text-black mb-3">
              WE&apos;RE HERE FOR YOU
            </p>

            <h2 className="text-6xl font-bold text-[#0A5C4A] leading-tight mb-4">
              Have Questions?
              <br />
              Get In Touch!
            </h2>

            <p className="text-lg font-semibold text-black mb-8">
              One quick call and you look wonderful!
            </p>

            {/* CONTACT BUTTONS */}
            <div className="flex flex-col gap-3 w-fit">
              <a
                href="mailto:info@feetbyfoot.com"
                className="flex items-center gap-3 bg-black text-[#F8D317] px-5 py-2 text-sm font-semibold"
              >
                <span className=" p-1">
                  <OpenEnvelopeIcon width={24} height={24} fill="#F8D317" />
                </span>
                info@feetbyfoot.com
              </a>

              <a
                href="tel:+919896454666"
                className="flex items-center gap-3 bg-black text-[#F8D317] px-5 py-2 text-sm font-semibold"
              >
                <span className=" p-1">
                  <ChatPhoneIcon width={24} height={24} fill="#F8D317" />
                </span>
                +91-9896454666
              </a>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative w-[360px] h-[360px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src="/assets/images/home1_img-15.jpg" // ← FIRST IMAGE
              alt="Customer support"
              fill
              className="object-cover"
              priority
            />
          </div>

        </div>
      </section>
    </Container>
  );
}

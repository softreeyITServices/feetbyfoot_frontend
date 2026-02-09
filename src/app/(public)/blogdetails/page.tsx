import Image from "next/image";

export default function BlogDetailPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-[1130px] px-4 pt-6 pb-12">

        {/* TOP META TITLE */}
        <p className="mb-4 text-center text-[12px] font-medium text-[#1FA6A0]">
          How To Choose The Right Men&apos;s Socks For Daily Use? | Feetbyfoot
        </p>

        {/* HERO IMAGE */}
        <div className="mb-6">
          <Image
            src="/assets/images/blog-hero.png"
            alt="How to choose the right men's socks"
            width={1000}
            height={760}
            className="w-full object-cover"
            priority
          />
        </div>

        {/* ARTICLE CONTENT */}
        <article className="text-[14px] leading-6 text-[#444] flex flex-col gap-4">

          <p>
            Choosing the right pair of men&apos;s socks for daily use might seem like
            a small detail, but it can make a world of difference in your comfort
            and style. The perfect socks not only keep your feet happy but also
            complete your look.
          </p>

          <p>
            From fabric choices to fit, this guide breaks down everything you need
            to know before buying socks for everyday wear.
          </p>

          <p className="font-semibold text-[#008080]">
            1. Focus on Fabric
          </p>

          <p>
            The material of your socks is crucial for comfort and performance.
            Different fabrics offer different benefits.
          </p>

          <p>
            <strong>Cotton:</strong> Soft, breathable, and absorbent, making it a
            popular choice for everyday wear.
          </p>

          <p>
            <strong>Bamboo:</strong> Known for its moisture-wicking, softness, and
            antibacterial properties.
          </p>

          <p>
            <strong>Synthetic blends:</strong> Often blended with natural fibers
            for added durability and stretch.
          </p>

          <p className="font-semibold text-[#008080]">
            2. Choose the Right Fit
          </p>

          <p>
            Socks should fit snugly without being too tight. Avoid socks that bunch
            up or slide down during the day.
          </p>

          <p className="font-semibold text-[#008080]">
            3. Pick the Right Length
          </p>

          <p>
            Ankle socks are great for casual wear, while crew socks work well for
            office and everyday use.
          </p>

          <p className="font-semibold text-[#008080]">
            Final Thoughts
          </p>

          <p>
            Investing in high-quality socks is an investment in your daily comfort
            and confidence. Choose wisely and your feet will thank you.
          </p>

          {/* FAQ */}
          <div className="pt-8 flex flex-col gap-4">

            <p className="font-semibold text-[#222]">
              Frequently Asked Questions (FAQs)
            </p>

            <div>
              <p className="font-medium text-[#222]">
                What Are the Best Men&apos;s Socks for Daily Use?
              </p>
              <p>
                The best socks for daily use are typically made from a blend of
                cotton or bamboo with a small amount of elastane.
              </p>
            </div>

            <div>
              <p className="font-medium text-[#222]">
                Which Fabric Is Ideal for Daily Wear Socks for Men?
              </p>
              <p>
                Cotton is breathable and soft, while merino wool is great for
                temperature control.
              </p>
            </div>

            <div>
              <p className="font-medium text-[#222]">
                How Do I Choose the Right Size Men&apos;s Socks?
              </p>
              <p>
                Check the size guide and ensure the sock size matches your shoe
                size.
              </p>
            </div>

            <div>
              <p className="font-medium text-[#222]">
                Are Ankle Socks Good for Daily Use?
              </p>
              <p>
                Yes, ankle socks are perfect for casual wear and warmer climates.
              </p>
            </div>

          </div>

        </article>

        {/* TAGS & SHARE */}
        <div className="mt-8 flex items-center justify-between text-[13px] text-[#666]">
          <div className="flex gap-4">
            <span>Tags:</span>
            <span>Men&apos;s Fashion</span>
            <span>Socks</span>
            <span>Style Guide</span>
          </div>

          <div className="flex gap-4">
            <span>Share:</span>
            <span>FB</span>
            <span>TW</span>
            <span>IN</span>
          </div>
        </div>

        {/* LEAVE A REPLY */}
        <div className="mt-10">
          <p className="mb-1 font-semibold text-[#222]">
            Leave a Reply
          </p>
          <p className="mb-4 text-[13px] text-[#666]">
            Your email address will not be published. Required fields are marked *
          </p>

          <form className="flex flex-col gap-4">
            <textarea
              className="border px-3 py-2 text-[13px]"
              rows={4}
              placeholder="Comment"
            />

            <div className="grid grid-cols-2 gap-4">
              <input className="border px-3 py-2 text-[13px]" placeholder="Name" />
              <input className="border px-3 py-2 text-[13px]" placeholder="Email" />
            </div>

            <input
              className="border px-3 py-2 text-[13px]"
              placeholder="Website"
            />

            <button className="mt-4 mx-auto bg-black px-6 py-2 text-[13px] font-semibold text-white">
              Post Comment
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}

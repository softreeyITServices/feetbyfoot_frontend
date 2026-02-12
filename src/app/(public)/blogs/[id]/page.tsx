"use client";

import Footer from "@/component/common/Footer";
import Navbar from "@/component/common/navbar";
import Image from "next/image";
import React from "react";

export default function BlogDetailPage() {
  return (
    <>
    <Navbar/>
    <main className="bg-white">
      <div className="mx-auto max-w-245 px-4 py-10">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-normal text-[22px] leading-[150%] text-neutral-900">
            How To Choose The Right Men’s Socks For Daily Use? | Feetbyfoot
          </h1>

          <p className="mt-2 text-[12px] text-neutral-500">
            By Feet by Foot — December 25, 2023
          </p>
        </div>

        {/* Hero Image */}
        <div className="mt-6 overflow-hidden">
          <Image
            src="/assets/images/mens_socks_daily_use.png"
            alt="How to choose the right men's socks"
            width={1600}
            height={900}
            className="h-auto w-full object-cover"
            priority
          />
        </div>

        {/* Article Content */}
        <article className="mx-auto mt-8 max-w-190 text-[14px] leading-[170%] text-neutral-700">
          <p>
            Choosing the right pair of men’s socks for daily use might seem like
            a small detail, but it can make a world of difference in your
            comfort and style. The perfect socks not only keep your feet happy
            but also complete your outfit. Here’s a comprehensive guide to help
            you make the best choice every day.
          </p>

          {/* Section 1 */}
          <section className="mt-6">
            <h2 className="text-[16px] font-semibold text-emerald-700">
              1. Focus On Fabric First
            </h2>

            <p className="mt-3">
              The material of your socks is crucial for comfort and performance.
              Different fabrics offer different benefits:
            </p>

            <ul className="mt-3 space-y-2">
              <li>
                <strong>Cotton:</strong> Soft, breathable, and absorbent, making
                it a popular choice for everyday wear.
              </li>
              <li>
                <strong>Merino Wool:</strong> Excellent for temperature
                regulation and moisture-wicking, keeping feet dry and
                comfortable in any weather.
              </li>
              <li>
                <strong>Bamboo:</strong> Known for its incredible softness,
                eco-friendliness, and antibacterial properties.
              </li>
              <li>
                <strong>Synthetics (Nylon, Polyester):</strong> Often blended
                with natural fibers for added durability and stretch.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="mt-6">
            <h2 className="text-[16px] font-semibold text-emerald-700">
              2. Choose The Right Fit Socks
            </h2>

            <p className="mt-3">
              Ill-fitting socks can be a major annoyance, leading to bunching,
              slipping, or uncomfortable tightness. A well-fitting sock should
              be snug but not constricting. Check size charts and consider socks
              with a reinforced heel and seamless toe for an optimal fit that
              prevents blisters and irritation.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mt-6">
            <h2 className="text-[16px] font-semibold text-emerald-700">
              3. Pick The Right Length For Your Lifestyle
            </h2>

            <p className="mt-3">
              Sock length should align with your activity and choice of
              footwear. Here are the common lengths:
            </p>

            <ul className="mt-3 space-y-2">
              <li>
                <strong>No-Show:</strong> Perfect for loafers, boat shoes, and
                sneakers for a sockless look.
              </li>
              <li>
                <strong>Ankle:</strong> Sit right on the ankle bone, ideal for
                athletic activities and casual wear.
              </li>
              <li>
                <strong>Crew:</strong> The most common length, extending
                mid-calf. Versatile for both casual and formal settings.
              </li>
              <li>
                <strong>Over-the-Calf:</strong> Offer maximum coverage and stay
                up all day, best for formal trousers and boots.
              </li>
            </ul>
          </section>

          {/* Final Thoughts */}
          <section className="mt-6">
            <h2 className="text-[16px] font-semibold text-emerald-700">
              Final Thoughts
            </h2>

            <p className="mt-3">
              Investing in high-quality socks is an investment in your daily
              comfort and confidence. By focusing on the key elements—comfort,
              fit, fabric, and style—you can build a sock collection that not
              only feels great but also enhances your personal style. Happy feet
              lead to a happy day!
            </p>
          </section>

          {/* Divider */}
          <div className="my-10 h-px bg-neutral-200" />

          {/* FAQ */}
          <section>
            <h2 className="text-[18px] font-semibold text-neutral-900">
              Frequently Asked Questions (FAQs)
            </h2>

            <div className="mt-6 space-y-6">
              <FaqItem
                question="What Are The Best Men’s Socks For Daily Use?"
                answer="The best socks for daily use are typically made from a blend of cotton for softness, and a small amount of spandex or elastane for stretch and fit."
              />

              <FaqItem
                question="Which Fabric Is Ideal For Daily Wear Socks For Men?"
                answer="Cotton and merino wool are excellent choices. Cotton is breathable and soft, while merino wool is great for moisture-wicking and temperature control."
              />

              <FaqItem
                question="How Do I Choose The Right Size Men’s Socks?"
                answer="Check the brand’s size guide, which usually corresponds to shoe size. A good fit means the heel pocket aligns with your heel and the sock is snug without being tight."
              />

              <FaqItem
                question="Are Ankle Socks Good For Daily Use?"
                answer="Yes, ankle socks are great for casual daily use, especially with sneakers and during warmer weather. For office or formal wear, crew or over-the-calf socks are more appropriate."
              />
            </div>
          </section>

          {/* Divider */}
          <div className="my-10 h-px bg-neutral-200" />

          {/* Tags + Share */}
          <div className="flex flex-col gap-6 text-[12px] sm:flex-row sm:items-center sm:justify-between">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-neutral-700">Tags:</span>

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
                Men&apos;s Fashion
              </span>

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
                Socks
              </span>

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
                Style Guide
              </span>
            </div>

            {/* Share */}
            <div className="flex items-center gap-3">
              <span className="font-medium text-neutral-700">Share:</span>

              <button
                type="button"
                className="h-8 w-8 rounded-full border border-neutral-300 text-[12px] text-neutral-500 hover:bg-neutral-100"
                aria-label="Share on Facebook"
              >
                F
              </button>

              <button
                type="button"
                className="h-8 w-8 rounded-full border border-neutral-300 text-[12px] text-neutral-500 hover:bg-neutral-100"
                aria-label="Share on Twitter"
              >
                T
              </button>

              <button
                type="button"
                className="h-8 w-8 rounded-full border border-neutral-300 text-[12px] text-neutral-500 hover:bg-neutral-100"
                aria-label="Share on Instagram"
              >
                I
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="my-10 h-px bg-neutral-200" />

          {/* Leave a Reply */}
          <section>
            <h2 className="text-[18px] font-semibold text-neutral-900">
              Leave a Reply
            </h2>

            <p className="mt-3 text-[13px] text-neutral-600">
              Your email address will not be published. Required fields are
              marked *
            </p>

            <form className="mt-6 space-y-6">
              {/* Name + Email */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full rounded-md border border-neutral-200 px-4 py-3 text-[14px] text-neutral-800 outline-none focus:border-emerald-500"
                />

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-md border border-neutral-200 px-4 py-3 text-[14px] text-neutral-800 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Comment */}
              <textarea
                rows={8}
                placeholder="Comment"
                className="w-full rounded-md border border-neutral-200 px-4 py-3 text-[14px] text-neutral-800 outline-none focus:border-emerald-500"
              />

              {/* Submit Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  className="flex items-center gap-2 bg-neutral-900 px-10 py-3 text-[13px] font-medium text-white hover:opacity-90"
                >
                  Post Comment <span aria-hidden>↗️</span>
                </button>
              </div>
            </form>
          </section>
        </article>
      </div>
    </main>
    <Footer/>
    </>
    
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-b border-neutral-200 pb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-[15px] font-semibold text-neutral-900">
          {question}
        </span>
        <span className="text-neutral-500">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <p className="mt-3 text-[14px] leading-[170%] text-neutral-700">
          {answer}
        </p>
      )}
    </div>
  );
}
import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import Link from "next/link";

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: "How long does shipping take?",
    answer:
      "Orders are usually processed within 24-48 hours. Standard delivery typically takes 3-7 business days depending on your location.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, we share a tracking link over email/SMS. You can also view current status from your account orders page.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "Yes, changes or cancellation are possible before dispatch. Reach out quickly through Contact Us or the Changes to Orders page.",
  },
  {
    question: "What is your return and refund policy?",
    answer:
      "Returns are accepted as per policy eligibility. After quality check, refunds are processed to your original payment method within standard banking timelines.",
  },
  {
    question: "How do I choose the correct size?",
    answer:
      "Please refer to our Size Guide for socks and shoe mapping. If you are between sizes, we recommend choosing the larger fit.",
  },
  {
    question: "Do you offer gift packs and combos?",
    answer:
      "Yes. You can explore curated gift packs from the Gifts section and combo selections available on the shop pages.",
  },
  {
    question: "Are these socks suitable for kids and adults?",
    answer:
      "Yes, we have collections for kids, women, and men with varied lengths and styles designed for comfort and durability.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can connect with us from the Contact Us page. Our support team is available to help with orders, returns, and product queries.",
  },
];

export default function FAQsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <section className="mx-auto w-full max-w-7xl px-4 py-14">
          <header className="text-center">
            <h1 className="inline-block bg-yellow-400 px-12 py-3 text-3xl font-bold text-black md:text-4xl">
              FAQs
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-600 md:text-base">
              Quick answers to the most common questions about orders, shipping,
              returns, sizing, and support.
            </p>
          </header>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4">
            {FAQS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-semibold text-gray-900">
                  <span>{item.question}</span>
                  <span className="mt-0.5 text-xl leading-none text-[#00C484] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-700">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          <section className="mx-auto mt-12 max-w-4xl rounded-2xl bg-[#F8FFFC] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-semibold text-gray-900">
              Still have a question?
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              We are happy to help. Reach out to our support team and we will
              guide you quickly.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/contactus"
                className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Contact Support
              </Link>
              <Link
                href="/sizeguide"
                className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
              >
                View Size Guide
              </Link>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}

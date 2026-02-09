import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import { CautionIcon } from "@/icons/CautionIcon";

import { ExchangeIcon } from "@/icons/ExchangeIcon";

import { RefundsIcon } from "@/icons/RefundsIcon";
import { ReturnsIcon } from "@/icons/ReturnsIcon";
import { ReturnShippingIcon } from "@/icons/ReturnShippingIcon";

import { PhoneIcon } from "@/icons/PhoneIcon";
import { EmailIcon } from "@/icons/EmailIcon";


const cardBase = "rounded-lg bg-white p-6 outline outline-1 outline-gray-200 shadow-sm";


export default function RefundAndReturnsPage() {
  return (
    <>
      <Navbar />
      <main className="w-full bg-white">
        {/* HEADER */}
        <section className="px-4 pt-12 pb-16">
          <div className="mx-auto max-w-282.25 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Refund & Returns Policy
            </h1>
            <p className="mt-3 max-w-170 mx-auto text-sm text-gray-600">
              At FeetByFoot, your satisfaction is our priority. We aim to provide high-quality socks and
              shoes, but if you are not completely happy with your purchase, we’re here to help.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-282.25">
            {/* 4 CARDS */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Returns */}
              <div className={cardBase}>
                <div className="mb-4 flex items-center gap-2">
                  <ReturnsIcon />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Returns
                  </h3>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Eligibility:</span> Items must be
                  returned within 7 days of delivery.
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Condition:</span> Products must be
                  unused, unwashed, and in their original packaging with tags
                  intact.
                </p>

                <p className="text-sm font-medium text-gray-900 mb-2">
                  Non-returnable items:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Socks that have been worn or tried on.</li>
                  <li>
                    Products purchased on sale or during promotions (unless
                    defective).
                  </li>
                </ul>
              </div>

              {/* Refunds */}
              <div className={cardBase}>
                <div className="mb-4 flex items-center gap-2">
                  <RefundsIcon />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Refunds
                  </h3>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  Once your return is received and inspected, we will notify you
                  of the approval or rejection of your refund.
                </p>
                <p className="text-sm text-gray-700">
                  If approved, your refund will be processed within 5–7 business
                  days and credited to your original payment method.
                </p>
              </div>

              {/* Exchanges */}
              <div className={cardBase}>
                <div className="mb-4 flex items-center gap-2">
                  <ExchangeIcon />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Exchanges
                  </h3>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  We only replace items if they are defective or damaged.
                </p>
                <p className="text-sm text-gray-700">
                  To request an exchange, email{" "}
                  <span className="font-medium">
                    support@feetbyfoot.com
                  </span>{" "}
                  and we’ll guide you through the process.
                </p>
              </div>

              {/* Return Shipping */}
              <div className={cardBase}>
                <div className="mb-4 flex items-center gap-2">
                  <ReturnShippingIcon />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Return Shipping
                  </h3>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  Customers are responsible for paying their own
                  shipping costs for returning items. Shipping costs are
                  non-refundable.
                </p>
                <p className="text-sm text-gray-700">
                  In case of wrong or defective products, we will cover
                  the return shipping.
                </p>
              </div>
            </div>

            {/* HOW TO INITIATE RETURN (FULL WIDTH CARD) */}
            <div className={`mt-8 ${cardBase}`}>
              <h3 className="text-center text-sm font-semibold text-gray-900 mb-8">
                How to Initiate a Return
              </h3>

              <div className="grid gap-6 sm:grid-cols-3 text-center">
                {[
                  {
                    step: 1,
                    title: "Email Us",
                    text:
                      "Send your order number and return reason to support@feetbyfoot.com",
                  },
                  {
                    step: 2,
                    title: "Get Instructions",
                    text:
                      "We’ll send you return instructions and address details.",
                  },
                  {
                    step: 3,
                    title: "Ship Product",
                    text:
                      "Ship the product back as per the instructions provided.",
                  },
                ].map((s) => (
                  <div key={s.step}>
                    <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#00C484] text-sm font-semibold text-white">
                      {s.step}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {s.title}
                    </p>
                    <p className="text-sm text-gray-600">{s.text}</p>
                  </div>
                ))}
              </div>

              {/* HYGIENE NOTE */}
              <div className="mt-8 flex gap-2 rounded-md bg-yellow-50 px-4 py-3 text-sm text-[#000000]">
                <CautionIcon />
                <span>
                  <strong>Important Hygiene Note:</strong>
                  <br />
                  Feet hygiene is our top concern. For safety reasons, we reserve the right to decline returns that don’t meet our
                  hygiene policy.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#00C484] px-4 py-14">
          <div className="mx-auto max-w-282.25 text-center text-white">
            <h2 className="text-lg font-semibold mb-2">
              Still have questions?
            </h2>
            <p className="text-sm mb-6">
              Our support team is happy to help.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm text-gray-900">
                <EmailIcon className="h-4 w-4" />
                support@feetbyfoot.com
              </div>
              <div className="flex items-center gap-2 rounded-md bg-yellow-400 px-4 py-2 text-sm text-gray-900">
                <PhoneIcon className="h-4 w-4" />
                +91-9896545686
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>

  );
}

import Footer from "@/component/common/Footer";
import Navbar from "@/component/common/navbar";
import { CallWhatsappIcon } from "@/icons/CallWhatsappIcon";
import { CautionIcon } from "@/icons/CautionIcon";
import { EmailIcon } from "@/icons/EmailIcon";
import { TimingIcon } from "@/icons/TimingIcon";



export default function ChangesToOrdersPage() {
  return (
    <>
      <Navbar />
      <main className="w-full bg-white">
        <div className="mx-auto max-w-282.25 px-4 py-12">
          {/* PAGE HEADER */}
          <header className="mb-10 text-center">
            <h1 className="text-[30px] font-bold leading-9 text-gray-900">
              Changes to Orders
            </h1>
            <p className="mt-2 max-w-180 mx-auto text-sm text-gray-600">
              We understand that sometimes you may need to make changes after
              placing an order. At FeetByFoot, we try to be as flexible as possible.
            </p>
          </header>

          {/* MAIN CARD */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
            {/* CAN I CHANGE */}
            <h2 className="text-base font-semibold text-gray-900">
              Can I Change or Cancel My Order?
            </h2>
            <p className="mt-2 text-sm text-gray-700 max-w-190">
              Yes — but only before your order is processed or shipped. To request a
              change or cancellation, please contact us promptly.
            </p>

            {/* HOW TO REQUEST */}
            <div className="mt-5 rounded-lg border border-[#00C484] bg-[#EFFFF8] px-6 py-5">
              {/* TEXT */}
              <p className="text-sm font-semibold text-gray-900">
                How to Request a Change:
              </p>

              <p className="mt-1 text-sm text-gray-700">
                Please mention your <strong>Order Number</strong> and the changes you need.
              </p>

              {/* CARDS */}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* EMAIL CARD */}
                <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md">
                    <EmailIcon className="h-4 w-4 text-[#00C484]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Email Us
                    </p>
                    <p className="text-sm text-gray-600">
                      support@feetbyfoot.com
                    </p>
                  </div>
                </div>

                {/* CALL CARD */}
                <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md">
                    <CallWhatsappIcon className="h-4 w-4 text-[#00C484]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Call / WhatsApp
                    </p>
                    <p className="text-sm text-gray-600">
                      +91-9896545686
                    </p>
                  </div>
                </div>
              </div>
            </div>




            {/* NOTE */}
            <div className="mt-4 flex gap-3 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              <CautionIcon className="h-5 w-5 shrink-0 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold">Note: Order Dispatched</p>
                <p>
                  Once an order is dispatched from our warehouse, we won’t be able
                  to modify or cancel it.
                </p>
              </div>
            </div>

            <hr className="my-8 border-t border-gray-200" />

            {/* TWO COLUMN */}
            <div className="grid gap-6 md:grid-cols-2 items-start">
              {/* LEFT */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  What Changes Can Be Made?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#00C484]" />
                    <strong>Size or color change</strong>  (subject to stock availability)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#00C484]" />
                    <strong>Shipping address correction</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#00C484]" />
                    <strong>Contact number update</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#00C484]" />
                    <strong>Order cancellation</strong> (if not yet shipped)
                  </li>
                </ul>
              </div>

              {/* RIGHT */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TimingIcon className="h-4 w-4 text-[#00C484]" />
                  <p className="text-sm font-semibold text-gray-900">
                    Time Window for Changes
                  </p>
                </div>
                <p className="text-sm text-gray-700">
                  You have up to <strong>6 hours</strong> after placing the order to
                  request any changes. After that, your order may already be
                  processing and cannot be modified.
                </p>
              </div>
            </div>

            <hr className="my-8 border-t border-gray-200" />

            {/* AFTER SHIPPING */}
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              What If I Need to Cancel After Shipping?
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              If your order has already been shipped, you have two options:
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold mb-1">
                  1. Refuse the Delivery
                </p>
                <p className="text-sm text-gray-700">
                  Inform the delivery agent that you are refusing the package.
                </p>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-4">
                <p className="text-sm font-semibold mb-1">
                  2. Accept and Return
                </p>
                <p className="text-sm text-gray-700">
                  Accept the delivery and then initiate a return as per our Return
                  Policy.
                </p>
              </div>
            </div>

            <hr className="my-8 border-t border-gray-200" />

            {/* IMPORTANT */}
            <h3 className="text-sm font-semibold text-red-600 mb-3">
              Important Considerations
            </h3>
            <ul className="space-y-2 text-sm text-red-600">
              <li>
                • COD Orders: Refusing a COD order without prior cancellation may
                affect future orders.
              </li>
              <li>
                • Frequent cancellations may lead to account restrictions.
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

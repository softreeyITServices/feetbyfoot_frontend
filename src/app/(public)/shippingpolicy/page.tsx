import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import { EmailIcon } from "@/icons/EmailIcon";
import { PhoneIcon } from "lucide-react";


export default function ShippingPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="w-full bg-white">
        <div className="mx-auto px-4 py-12">
          {/* PAGE HEADER */}
          <div className="mx-auto max-w-282.25 text-center mb-10">
            <h1 className="text-2xl font-semibold text-gray-900">
              Shipping Policy
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Effective Date: 05-08-2025
            </p>
          </div>

          {/* CARD */}
          <section className="mx-auto max-w-282.25 rounded-lg border border-gray-300 bg-white p-6 sm:p-8 lg:p-10">
            {/* INTRO — INSIDE CARD */}
            <p className="mx-auto max-w-160 text-center text-sm text-gray-700 leading-relaxed">
              At FeetByFoot, we strive to deliver your orders safely, quickly, and
              affordably. Here’s everything you need to know about our shipping
              process.
            </p>

            <hr className="my-10 border-none" />

            {/* ORDER PROCESSING */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                📦 Order Processing Time
              </h2>
              <p className="mt-3 text-sm text-gray-700">
                All orders are processed within 24–48 hours (excluding Sundays and
                public holidays). Once shipped, you’ll receive a tracking number
                via SMS/email to monitor your delivery.
              </p>
            </section>

            <hr className="border-none my-10" />

            {/* DELIVERY TIME */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                🚚 Delivery Time & Estimates
              </h2>

              <div className="mt-4 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Estimated Delivery Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3">Metro Cities</td>
                      <td className="px-4 py-3">3–5 business days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Tier 2 & 3 Cities</td>
                      <td className="px-4 py-3">4–7 business days</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Rural & Remote Areas</td>
                      <td className="px-4 py-3">5–9 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-md bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                ⏱ Delays may occur during festivals, sales, or extreme weather.
              </div>
            </section>

            <hr className="border-none my-10" />

            {/* SHIPPING CHARGES */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                💰 Shipping Charges
              </h2>
              <ul className="mt-4 list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>Free shipping on prepaid orders above ₹499.</li>
                <li>Flat ₹49 shipping fee for orders below ₹499.</li>
                <li>Cash on Delivery (COD) available with a ₹30 COD charge.</li>
              </ul>
            </section>

            <hr className="border-none my-10" />

            {/* DELIVERY PARTNERS */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                📦 Delivery Partners
              </h2>
              <p className="mt-3 text-sm text-gray-700">
                We ship with trusted delivery partners to ensure reliable and
                timely delivery.
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {["Delhivery", "Bluedart", "Xpressbees", "Ecart", "India Post"].map(
                  (partner) => (
                    <span
                      key={partner}
                      className="rounded-full border border-gray-900 px-4 py-1"
                    >
                      {partner}
                    </span>
                  )
                )}
              </div>
            </section>

            <hr className="border-none my-10" />

            {/* NON SERVICEABLE */}
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                📍 Non-Serviceable Pin Codes
              </h2>
              <p className="mt-3 text-sm text-gray-700">
                In rare cases, some pin codes may not be serviceable. We’ll inform
                you via call or email and offer:
              </p>
              <ul className="mt-3 list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>A different delivery address (if available)</li>
                <li>Or a full refund if delivery isn’t possible</li>
              </ul>
            </section>

            <hr className="border-none my-10" />

            {/* ORDER NOT RECEIVED */}
            <section className="rounded-lg bg-green-50 p-6">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-4 w-0.75 rounded-full bg-red-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Order Not Received?
                </h3>
              </div>

              <p className="mt-3 text-sm text-gray-700">
                If your order hasn’t arrived within the estimated time, please:
              </p>

              <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm text-gray-700">
                <li>Check your tracking link.</li>
                <li>Contact our support team — we’re here to help.</li>
              </ol>

              <div className="mt-5 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm">
                  <EmailIcon className="h-4 w-4" />
                  support@feetbyfoot.com
                </div>
                <div className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm">
                  <PhoneIcon className="h-4 w-4" />
                  +91 9876545686
                </div>
              </div>
            </section>

            <hr className="border-none my-10" />

            {/* PACKAGING */}
            <section className="text-center">
              <h2 className="flex justify-center items-center gap-2 text-sm font-semibold text-gray-900">
                📦 Packaging
              </h2>
              <p className="mt-3 text-xs text-gray-600 max-w-md mx-auto">
                All orders are shipped in tamper-proof, eco-friendly packaging to
                ensure product safety and sustainability.
              </p>
            </section>
          </section>
        </div>
      </main>
      <Footer />
    </>

  );
}

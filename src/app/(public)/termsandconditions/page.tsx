import { EmailIcon } from "@/icons/EmailIcon";
import { PhoneIcon } from "@/icons/PhoneIcon";
import { AddressIcon } from "@/icons/AddressIcon";
import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navbar />
      <main className="w-full bg-white">
      <div className="mx-auto px-4 py-12">
        {/* PAGE HEADER */}
        <div className="mx-auto max-w-282.25 text-center mb-10">
          <h1 className="text-2xl font-semibold text-gray-900">
            Terms and Conditions
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Effective Date: 05-08-2025
          </p>
        </div>

        {/* OUTER BORDERED CONTAINER (THIS WAS MISSING) */}
        <section className="mx-auto max-w-282.25 rounded-lg border border-gray-200 bg-white px-6 py-10 sm:px-8 lg:px-10">
          {/* INTRO */}
          <p className="mx-auto max-w-160 text-center text-sm text-gray-700 leading-relaxed mb-12">
            Welcome to FeetByFoot! By using our website or placing an order, you agree to the terms below. Please read them carefully.
          </p>

          {/* TERMS LIST */}
          <div className="space-y-10">
            {[
              {
                title: "General",
                text:
                  "We make every effort to display accurate product descriptions, images, and sizes. Colors may vary slightly due to different screen displays or lighting. We reserve the right to change prices, discontinue products, or modify packaging without notice."
              },
              {
                title: "Product Information",
                text:
                  "We make every effort to display accurate product descriptions, images, and sizes. Colors may vary slightly due to different screen displays or lighting. We reserve the right to change prices, discontinue products, or modify packaging without notice.",
              },
              {
                title: "Orders & Payments",
                text:
                  "Orders are confirmed only after successful payment (for prepaid) or when accepted for Cash on Delivery (COD).We reserve the right to cancel or refuse any order due to stock unavailability, address issues, or suspected fraud.By placing an order, you confirm that all information provided is accurate and up to date.",
              },
              {
                title: "Shipping",
                text:
                  "Orders are usually shipped within 24–48 hours. Estimated delivery time depends on your location (see our Shipping Policy). We are not responsible for delays caused by courier partners or force majeure events (strikes, weather,etc.).",
              },
              {
                title: "Returns & Refunds",
                text:
                  "Returns are accepted within 7 days of delivery, subject to our Return Policy. Socks must be unworn and unused for hygiene reasons. Refunds are processed after product inspection and take 5–7 business days to reflect.",
              },
              {
                title: "Use of Website",
                text:
                  "You agree not to use our website for any illegal or harmful activity. Unauthorized copying, use, or distribution of content or images is strictly prohibited.",
              },
              {
                title: "Privacy",
                text:
                  "Your data is handled securely as per our Privacy Policy. We do not share your personal data with third parties for marketing without consent.",
              },
              {
                title: "Offers & Discounts",
                text:
                  "Discounts are time-bound and applicable only to selected products. We reserve the right to withdraw or change any offer without prior notice. Only one coupon code can be used per order unless stated otherwise.",
              },
              {
                title: "Intellectual Property",
                text:
                  "All logos, content, images, and designs are the property of FeetByFoot. You may not reproduce, reuse, or modify any part of our branding or website.",
              },
              {
                title: "Governing Law",
                text:
                  "These Terms are governed by the laws of India. In case of disputes, jurisdiction will lie in the courts of [Your City/State].",
              },
            ].map((item, index) => (
              <div key={item.title} className="flex gap-4">
                {/* NUMBER */}
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-xs font-semibold text-white">
                  {index + 1}
                </div>

                {/* TEXT */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CONTACT US (INNER BORDER — CORRECT) */}
          <section className="rounded-lg border border-gray-200 bg-white px-6 py-6 mt-5">
            {/* Header */}
            <h3 className="text-base font-semibold text-gray-900">
              Contact Us
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              For any questions or support, contact us:
            </p>

            {/* Content */}
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-50">
                  <EmailIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Email
                  </p>
                  <p className="text-sm text-gray-600">
                    support@feetbyfoot.com
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-50">
                  <PhoneIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Phone
                  </p>
                  <p className="text-sm text-gray-600">
                    +91-9896454666
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-50">
                  <AddressIcon className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Address
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    SCO – 9, Eldeco County, 1st Floor, Sector 19, Sonipat,
                    Haryana 131001
                  </p>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
    <Footer/>
    </>
    
  )
}


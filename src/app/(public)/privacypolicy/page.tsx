import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import { AddressIcon } from "@/icons/AddressIcon";
import { EmailIcon } from "@/icons/EmailIcon";
import { PhoneIcon } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="w-full bg-white">
        <div className="mx-auto px-4 py-12">
          {/* PAGE HEADING (OUTSIDE CARD) */}
          <div className="mx-auto max-w-282.25 text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Effective Date: 01-01-2025
            </p>
          </div>

          {/* CARD */}
          <section
            className="
            mx-auto
            w-full
            max-w-282.25
            rounded-lg
            border
            border-gray-200
            bg-white
            p-6
            sm:p-8
            lg:p-10
          "
          >
            <div className="flex flex-col gap-10">
              {/* INTRO */}
              <p className="text-sm leading-relaxed text-gray-700">
                At FeetByFoot, we value your trust and are committed to protecting your privacy.
                This Privacy Policy outlines how we collect, use,
                and safeguard your personal information when you visit or make a purchase from our website.
              </p>

              <hr className="border-gray-200" />

              {/* 1 */}
              <section>
                <h2 className="text-base font-semibold text-gray-900">
                  1. What Information We Collect
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  We may collect the following personal information:
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
                  <li>Name</li>
                  <li>Contact information (email, phone number, shipping address)</li>
                  <li>Payment Information (processed securely via third-party payment gateways; we do not store card details)</li>
                  <li>Order history</li>
                  <li>IP address, browser details, device type (for website analytics)</li>
                </ul>
              </section>

              <hr className="border-gray-200" />

              {/* 2 */}
              <section>
                <h2 className="text-base font-semibold text-gray-900">
                  2. How We Use Your Information
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  We use your information to:              </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
                  <li>Process and deliver your orders</li>
                  <li>Communicate order updates or support</li>
                  <li>Improve our website and user experience</li>
                  <li>Send promotional emails or offers (only if you opt-in)</li>
                  <li>Prevent fraud and ensure website security</li>
                </ul>
              </section>

              <hr className="border-gray-200" />

              {/* 3 */}
              <section>
                <h2 className="text-base font-semibold text-gray-900">
                  3. Data Protection
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  We take data protection seriously:              </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
                  <li>All data is stored securely.</li>
                  <li>Payments are encrypted and processed via trusted payment gateways.</li>
                  <li>We do not share your personal data with third parties for marketing.</li>
                  <li>We may share data with logistics, payment, and IT service providers solely to fulfill your order.</li>
                </ul>
              </section>

              <hr className="border-gray-200" />

              {/* 4 */}
              <section>
                <h2 className="text-base font-semibold text-gray-900">
                  4. Cookies
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  Our website uses cookies to:              </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
                  <li>Enable smooth navigation</li>
                  <li>Understand user behaviour</li>
                  <li>Improve site performance</li>
                </ul>
              </section>

              <hr className="border-gray-200" />

              {/* 5 */}
              <section>
                <h2 className="text-base font-semibold text-gray-900">
                  5. Email & SMS Marketing
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  We only send marketing emails or messages if you opt-in.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  You can unsubscribe anytime by clicking the &quot;unsubscribe&quot; link in our emails or replying STOP to SMS.
                </p>
              </section>

              <hr className="border-gray-200" />

              {/* 6 */}
              <section>
                <h2 className="text-base font-semibold text-gray-900">
                  6. Children&apos;s Privacy
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  Our website is not intended for individuals under the age of 13. We do not knowingly collect personal data from children.
                </p>
              </section>

              <hr className="border-gray-200" />

              {/* 7 */}
              <section>
                <h2 className="text-base font-semibold text-gray-900">
                  7. Your Rights
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  You have the right to:
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-700">
                  <li>Access your personal data</li>
                  <li>Request correction or deletion of your data</li>
                  <li>Opt-out of marketing at any time</li>
                </ul>
              </section>
              <p className="mt-4 text-sm leading-relaxed text-gray-700">
                To exercise your rights, <a href="mailto:support@feetbyfoot.com" className="text-[#00C484] hover:underline">contact us at support@feetbyfoot.com</a>
              </p>
              <hr className="border-gray-200" />


              <section className="rounded-md bg-gray-50 p-5">
                <h2 className="text-base font-semibold text-gray-900">
                  8. Contact Us
                </h2>

                <p className="mt-3 text-sm text-gray-700">
                  If you have questions about this Privacy Policy, reach out to us:
                </p>

                <div className="mt-5 space-y-4 text-sm text-gray-700">
                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <EmailIcon className="mt-0.5 h-4 w-4 text-gray-700" />
                    <span>support@feetbyfoot.com</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="mt-0.5 h-4 w-4 text-gray-700" />
                    <span>+91 9876543210</span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <AddressIcon className="mt-0.5 h-4 w-4 text-gray-700" />
                    <span>
                      123, Example Street, India
                    </span>
                  </div>
                </div>
              </section>

            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>

  );
}

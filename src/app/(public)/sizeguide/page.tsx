import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import { HeadphoneIcon } from "@/icons/HeadphoneIcon";
import Image from "next/image";

export default function SizeGuidePage() {
  const tableCard =
    "overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]";

  return (
    <>
      <Navbar />
      <main className="w-full bg-white">
        <div className="mx-auto max-w-282.25 px-4 py-14">
          {/* HEADER */}
          <header className="text-center mb-12">
            <h1 className="text-2xl font-semibold text-gray-900">
              Find Your Perfect Fit
            </h1>
            <p className="mt-2 text-sm text-gray-600 max-w-130 mx-auto">
              Our comprehensive size guide helps you choose the right socks and
              shoes with confidence.
            </p>
          </header>

          {/* HOW TO MEASURE */}
          <section className="w-full">
            <div
              className="
          flex flex-col md:flex-row items-center gap-6
          rounded-xl bg-white p-6
          shadow-[0_6px_24px_rgba(0,0,0,0.08)]
        "
            >
              {/* LEFT CONTENT */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  How to Measure Your Foot
                </h3>

                <ol className="space-y-3">
                  {/* Step 1 */}
                  <li className="flex gap-3">
                    <span
                      className="
                  flex h-6 w-6 shrink-0 items-center justify-center
                  rounded-full bg-[#00C484] text-xs font-semibold text-white
                "
                    >
                      1
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Place Your Foot</strong><br />
                      Lay a piece of paper on a flat, hard surface. Place your foot
                      firmly on the paper.
                    </p>
                  </li>

                  {/* Step 2 */}
                  <li className="flex gap-3">
                    <span
                      className="
                  flex h-6 w-6 shrink-0 items-center justify-center
                  rounded-full bg-[#00C484] text-xs font-semibold text-white
                "
                    >
                      2
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Trace and Mark</strong><br />
                      Using a pen or pencil, trace the outline of your foot. Mark the
                      tip of your longest toe and the back of your heel.
                    </p>
                  </li>

                  {/* Step 3 */}
                  <li className="flex gap-3">
                    <span
                      className="
                  flex h-6 w-6 shrink-0 items-center justify-center
                  rounded-full bg-[#00C484] text-xs font-semibold text-white
                "
                    >
                      3
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Measure the Length</strong><br />
                      Use a ruler to measure the straight-line distance between the
                      two marks. This is your foot length in cm.
                    </p>
                  </li>
                </ol>
              </div>

              {/* RIGHT IMAGE */}
              <div className="shrink-0">
                <div className="rounded-lg  p-4">
                  <Image
                    src="/assets/images/feet.png"
                    alt="How to measure your foot"
                    width={609.5}
                    height={609.5}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SOCKS SIZE GUIDE */}
          <section className="mb-14">
            <h3 className="font-inter font-bold text-[30px] leading-9 tracking-normal text-center align-middle">
              FeetByFoot – Socks Size Guide
            </h3>

            <div className={tableCard}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium">
                      Shoe Size (India/UK)
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      Socks Size
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      Fits Foot Length (cm)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-4">4–6</td>
                    <td className="px-6 py-4">Small (S) – 22</td>
                    <td className="px-6 py-4">24</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">6–9</td>
                    <td className="px-6 py-4">Medium (M) – 24</td>
                    <td className="px-6 py-4">27</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">9–11</td>
                    <td className="px-6 py-4">Large (L) – 27</td>
                    <td className="px-6 py-4">29</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">11–13</td>
                    <td className="px-6 py-4">Extra Large (XL) – 29</td>
                    <td className="px-6 py-4">31</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </section>

          {/* SOCK SIZE – KIDS & ADULTS */}
          <section className="mb-12">
            <h3 className="mb-4 mt-14 text-center text-sm font-semibold text-gray-900">
              FeetByFoot – Socks Size Guide (Kids + Adults)
            </h3>

            <div className={tableCard}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium">
                      Age Group
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      Shoe Size (India/UK)
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      Socks Size
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      Foot Length (cm)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-4">Infant (0–1 yr)</td>
                    <td className="px-6 py-4">0–2</td>
                    <td className="px-6 py-4">XXS</td>
                    <td className="px-6 py-4">10–12</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Toddler (1–3 yr)</td>
                    <td className="px-6 py-4">2–5</td>
                    <td className="px-6 py-4">XS</td>
                    <td className="px-6 py-4">12–15</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Kids (4–7 yr)</td>
                    <td className="px-6 py-4">5–10</td>
                    <td className="px-6 py-4">S</td>
                    <td className="px-6 py-4">15–19</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Kids (8–12 yr)</td>
                    <td className="px-6 py-4">10–2</td>
                    <td className="px-6 py-4">M</td>
                    <td className="px-6 py-4">19–22</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Teens & Adults</td>
                    <td className="px-6 py-4">3–5</td>
                    <td className="px-6 py-4">L</td>
                    <td className="px-6 py-4">22–24</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Adults</td>
                    <td className="px-6 py-4">6–9</td>
                    <td className="px-6 py-4">XL</td>
                    <td className="px-6 py-4">24–27</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Adults (Wide)</td>
                    <td className="px-6 py-4">10–13</td>
                    <td className="px-6 py-4">XXL</td>
                    <td className="px-6 py-4">27–31</td>
                  </tr>
                </tbody>
              </table>
            </div>


          </section>

          {/* SHOE SIZE GUIDE */}
          <section className="mb-14">
            <h3 className="mb-4 mt-14 text-center text-sm font-semibold text-gray-900">
              Shoe Size Guide (India / UK – Men & Women)
            </h3>

            <div className={tableCard}>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-medium">
                      Foot Length (cm)
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      India/UK Size
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      EU Size
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      US Men
                    </th>
                    <th className="px-6 py-4 text-left font-medium">
                      US Women
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-4">22</td>
                    <td className="px-6 py-4">3</td>
                    <td className="px-6 py-4">36</td>
                    <td className="px-6 py-4">4</td>
                    <td className="px-6 py-4">5.5</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">23</td>
                    <td className="px-6 py-4">4</td>
                    <td className="px-6 py-4">37</td>
                    <td className="px-6 py-4">5</td>
                    <td className="px-6 py-4">6.5</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">24</td>
                    <td className="px-6 py-4">5</td>
                    <td className="px-6 py-4">38</td>
                    <td className="px-6 py-4">6</td>
                    <td className="px-6 py-4">7.5</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">25</td>
                    <td className="px-6 py-4">6</td>
                    <td className="px-6 py-4">39</td>
                    <td className="px-6 py-4">7</td>
                    <td className="px-6 py-4">8.5</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">26</td>
                    <td className="px-6 py-4">7</td>
                    <td className="px-6 py-4">40</td>
                    <td className="px-6 py-4">8</td>
                    <td className="px-6 py-4">9.5</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">27</td>
                    <td className="px-6 py-4">8</td>
                    <td className="px-6 py-4">41</td>
                    <td className="px-6 py-4">9</td>
                    <td className="px-6 py-4">10.5</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">28</td>
                    <td className="px-6 py-4">9</td>
                    <td className="px-6 py-4">42</td>
                    <td className="px-6 py-4">10</td>
                    <td className="px-6 py-4">11.5</td>
                  </tr>
                </tbody>
              </table>
            </div>


          </section>

          {/* HELP */}
          <section className="mt-14">
            <div
              className="
      relative
      grid gap-6 md:grid-cols-2
      rounded-xl
      bg-[#F1F7FF]
      px-6 py-6 md:px-8
    "
            >
              {/* LEFT BLUE ACCENT */}
              <span className="absolute left-0 top-0 h-full w-0.75 rounded-l-xl bg-[#4F8CFF]" />

              {/* LEFT CONTENT */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  A Few Helpful Tips
                </h3>

                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  <li>All sizes are unisex and based on foot length.</li>
                  <li>If in doubt, choose the larger size for growing kids.</li>
                  <li>
                    Your shoe size is usually a dependable guide for choosing the right
                    sock size.
                  </li>
                </ul>
              </div>

              {/* RIGHT – WHITE CARD (THIS WAS MISSING) */}
              <div
                className="
        rounded-xl
        bg-white
        p-6
        shadow-[0_6px_20px_rgba(0,0,0,0.08)]
      "
              >
                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                  Still Unsure?
                </h3>

                <p className="mb-4 text-sm text-gray-700">
                  Our fit experts are here to help you find the perfect size.
                </p>

                <button
                  type="button"
                  className="
          inline-flex items-center gap-2
          rounded-full
          bg-[#FACC15]
          px-5 py-2.5
          text-sm font-semibold text-gray-900
          hover:opacity-90
          transition
        "
                >
                  {/* SVG will go here */}
                  <span className="flex h-4 w-4 items-center justify-center">
                    {/* replace with your SVG */}
                    <HeadphoneIcon />
                  </span>
                  Contact Customer Service
                </button>
              </div>
            </div>
          </section>


        </div>
      </main>
      <Footer />
    </>
  );
}

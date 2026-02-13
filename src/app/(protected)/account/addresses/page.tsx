import Footer from "@/component/common/Footer";
import Navbar from "@/component/common/navbar";
import { RefundsIcon } from "@/icons/RefundsIcon";
import { ReturnShippingIcon } from "@/icons/ReturnShippingIcon";
import { TipsIcon } from "@/icons/TipsIcon";

export default function AddressesPage() {
  return (
    <div className="py-10">
      <div className="max-w-6xl mx-auto px-6">

        {/* Top Text */}
        <p className="text-md text-gray-600 mb-6">
          The following addresses will be used on the checkout page by default.
        </p>

        {/* Address Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Home Address */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between min-h-[260px]">

            <div>
              <div className="flex items-center gap-2 mb-6">
                <RefundsIcon />
                <h2 className="font-semibold text-gray-800">
                  Home address
                </h2>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <RefundsIcon className="w-6 h-6" />
                </div>
                <p className="text-md text-gray-500">
                  You have not set up this type of address yet.
                </p>
              </div>
            </div>

            <button className="mt-6 bg-yellow-400 hover:bg-yellow-500 transition text-black font-medium py-2.5 rounded-md">
              + Add Billing address
            </button>
          </div>

          {/* Office Address */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between min-h-[260px]">

            <div>
              <div className="flex items-center gap-2 mb-6">
                <ReturnShippingIcon />
                <h2 className="font-semibold text-gray-800">
                  Office address
                </h2>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ReturnShippingIcon className="w-6 h-6" />
                </div>
                <p className="text-md text-gray-500">
                  You have not set up this type of address yet.
                </p>
              </div>
            </div>

            <button className="mt-6 bg-yellow-400 hover:bg-yellow-500 transition text-black font-medium py-2.5 rounded-md">
              + Add Shipping address
            </button>
          </div>
        </div>

        {/* Address Tips */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3">

            <TipsIcon className="mt-1" />

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Address Tips
              </h3>

              <ul className="text-md text-gray-700 space-y-2 list-disc pl-5">
                <li>
                  Make sure your billing address matches your payment method
                </li>
                <li>
                  Shipping address should be where you want your orders delivered
                </li>
                <li>
                  You can set different billing and shipping addresses if needed
                </li>
                <li>
                  These addresses will be used as defaults during checkout
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>

  );
}
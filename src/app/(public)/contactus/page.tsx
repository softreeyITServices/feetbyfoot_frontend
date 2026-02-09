import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white py-16 px-6">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-block bg-yellow-400 px-16 py-4">
            <h1 className="text-4xl font-bold text-black">Contact</h1>
          </div>
          <p className="mt-4 text-gray-600">
            Preorder now to receive exclusive deals & gifts
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">

          {/* LEFT SIDE - CONTACT INFO */}
          <div>
            <h2 className="text-3xl font-semibold mb-6">Information</h2>

            <div className="space-y-6">

              <div className="flex items-center gap-4">
                <Phone className="text-green-500 w-6 h-6" />
                <p className="text-gray-800">+91-9896454666</p>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="text-green-500 w-6 h-6" />
                <p className="text-gray-800">info@feetbyfoot.com</p>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="text-green-500 w-6 h-6" />
                <p className="text-gray-800 leading-relaxed">
                  2nd Floor, SCO 9, Eldeco County Rd, Sector 19, <br />
                  Sonipat, Haryana 131001
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="bg-black p-10 rounded-md shadow-xl">
            <h3 className="text-2xl font-semibold text-yellow-400 mb-8">
              Send us a Message
            </h3>

            <form className="space-y-6">
              {/* Full Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm">Full Name</label>
                  <input
                    type="text"
                    className="w-full mt-2 p-3 rounded bg-white text-black"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="text-white text-sm">Email Address</label>
                  <input
                    type="email"
                    className="w-full mt-2 p-3 rounded bg-white text-black"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-white text-sm">Phone Number</label>
                <input
                  type="text"
                  className="w-full mt-2 p-3 rounded bg-white text-black"
                  placeholder="+91 123 456 7890"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-white text-sm">Subject</label>
                <input
                  type="text"
                  className="w-full mt-2 p-3 rounded bg-white text-black"
                  placeholder="How can we help you?"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-white text-sm">Message</label>
                <textarea
                  rows={4}
                  className="w-full mt-2 p-3 rounded bg-white text-black"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-yellow-400 text-black font-semibold py-4 rounded hover:bg-yellow-500"
              >
                SEND MESSAGE
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

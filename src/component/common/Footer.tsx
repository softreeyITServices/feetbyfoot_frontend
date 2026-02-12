import Link from "next/link";
import Image from "next/image";
import { YoutubeIcon } from "@/icons/YoutubeIcon";
import { FacebookIcon } from "@/icons/FacebookIcon";
import { InstagramIcon } from "@/icons/InstagramIcon";
import { TwitterIcon } from "@/icons/TwitterIcon";
import { LinkedinIcon } from "@/icons/LinkedinIcon";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 bg-white shadow-[3px_3px_10px_#BFBFBE]">

      {/* TOP SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-14 flex flex-col md:flex-row md:justify-between gap-12 text-sm">

        {/* LEFT TEXT BLOCK */}
        <div className="md:w-2/5">
          <Link href="/" className="cursor-pointer">
            <Image
              src="/assets/images/footer_logo.png"
              alt="Feet by Foot"
              width={140}
              height={60}
              className="mb-4 w-full"
            />
          </Link>

          <p className="text-gray-700 leading-relaxed">
            At <span className="font-semibold text-green-700">Feet by Foot</span>, every pair of
            socks is a canvas. Collaborating with graphic designers, illustrators,
            street artists, and creators from across visual universes, we turn bold
            imagination into wearable art. These aren’t just socks — they’re
            expressions of creativity, crafted to bring color, story, and originality
            to every step you take.
          </p>
        </div>

        {/* RIGHT SIDE COLUMNS */}
        <div className="flex flex-wrap md:flex-nowrap gap-12 w-full md:w-3/5">

          {/* ABOUT US */}
          <div className="min-w-35">
            <h4 className="font-semibold mb-3 text-gray-900 text-lg">About Us</h4>
            <ul className="space-y-2 text-gray-700">
              <li><Link href="/workofart">About Us</Link> </li>
              <li><Link href="/blogs">Blog</Link></li>
              <li><Link href="/privacypolicy">Privacy Policy</Link></li>
              <li><Link href="/shippingpolicy">Shipping Policy</Link></li>
              <li><Link href="/termsandconditions">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div className="min-w-[160px]">
            <h4 className="font-semibold mb-3 text-gray-900 text-lg">Support</h4>
            <ul className="space-y-2 text-gray-700">
              <li><Link href="/refundreturnpolicy">Returns & Refunds</Link></li>
              <li><Link href="/contactus">Contact Us</Link></li>
              <li><Link href="/changesorders">Changes to Orders</Link></li>
              <li>FAQs</li>
              <li><Link href="/sizeguide">Size Guide</Link></li>
              <li>Track Your Order</li>
            </ul>
          </div>

          {/* QUICK LINKS */}
          <div className="min-w-35">
            <h4 className="font-semibold mb-3 text-gray-900 text-lg">Quick Links</h4>
            <ul className="space-y-2 text-gray-700">
              <li>Shop</li>
              <li>My Cart</li>
              <li>Checkout</li>
              <li>My Account</li>
              <li>My Wishlist</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-12 w-full md:w-2/5">
          {/* NEWSLETTER */}
          <div className="flex-1 min-w-55">
            <h4 className="font-semibold mb-3 text-green-700 text-2xl">
              Sign up for our Newsletter
            </h4>
            <p className="text-gray-700 leading-relaxed mb-4 text-md">
              Subscribe now to get 20% off your first order, plus special offers,
              free giveaways, and once-in-a-lifetime deals
            </p>

            <div className="border-b flex items-center pb-2">
              <input
                placeholder="Enter your email"
                className="w-full focus:outline-none"
              />
              <span className="text-gray-600"><Mail width={24} height={24} /></span>
            </div>

            {/* ICONS */}
            <div className="flex items-center gap-4 mt-4 text-xl text-gray-700 flex-row">
              <Link href="https://www.facebook.com" target="_blank" >
                <FacebookIcon width={24} height={24} />
              </Link>
              <Link href="https://www.youtube.com" target="_blank" >
                <YoutubeIcon width={24} height={24} />
              </Link>
              <Link href="https://www.twitter.com" target="_blank">
                <TwitterIcon width={24} height={24} />
              </Link>
              <Link href="https://www.linkedin.com" target="_blank">
                <LinkedinIcon width={24} height={24} />
              </Link>
              <Link href="https://www.instagram.com" target="_blank">
                <InstagramIcon width={24} height={24} />
              </Link>

            </div>
          </div>
        </div>
      </div >

      {/* YELLOW WAVE IMAGE */}

      < Image
        src="/assets/images/footer_bottom.png"
        alt="Decorative Footer"
        width={1920}
        height={120}
        className="w-full h-auto"
      />

      {/* BOTTOM COPYRIGHT */}
      < div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between gap-12 text-sm" >
        <p>
          Copyright © 2025{" "}
          <span className="font-semibold">Feet By Foot</span> All Rights Reserved.
          Powered by <span className="font-semibold">Elemetos Private Limited</span>
        </p>
        <Image
          src="/assets/images/ssl_secure.png"
          alt="SSL Secure"
          width={250}
          height={40}
        />
      </div >
    </footer >
  );
}

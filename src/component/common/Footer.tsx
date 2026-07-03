"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { newsletterService } from "@/domain/application/services/newsletter.service";
import { YoutubeIcon } from "@/icons/YoutubeIcon";
import { FacebookIcon } from "@/icons/FacebookIcon";
import { InstagramIcon } from "@/icons/InstagramIcon";
import { TwitterIcon } from "@/icons/TwitterIcon";
import { LinkedinIcon } from "@/icons/LinkedinIcon";
import FooterMenuColumns from "@/component/common/FooterMenuColumns";
import { CmsService } from "@/domain/application/services/admin/cms.service";
import type { CmsItem } from "@/domain/shared/types/admin/cms";

/** Admin → CMS page names (underscores). */
export const FOOTER_ABOUT_CMS_NAME = "footer_about_us";
export const FOOTER_NEWSLETTER_CMS_NAME = "footer_newsletter";

const DEFAULT_ABOUT = (
  <>
    At <span className="font-semibold text-green-700">Feet by Foot</span>, every pair of
    socks is a canvas. Collaborating with graphic designers, illustrators,
    street artists, and creators from across visual universes, we turn bold
    imagination into wearable art. These aren't just socks — they're
    expressions of creativity, crafted to bring color, story, and originality
    to every step you take.
  </>
);

const DEFAULT_NEWSLETTER_BODY = (
  <p className="text-gray-700 leading-relaxed mb-4 text-md">
    Subscribe now to get 20% off your first order, plus special offers,
    free giveaways, and once-in-a-lifetime deals
  </p>
);


export default function Footer() {
  const [about, setAbout] = useState<CmsItem | null>(null);
  const [newsletter, setNewsletter] = useState<CmsItem | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subscribeError, setSubscribeError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    setSubscribeStatus("loading");
    setSubscribeError("");
    try {
      await newsletterService.subscribe(subscribeEmail.trim());
      setSubscribeStatus("success");
      setSubscribeEmail("");
    } catch {
      setSubscribeStatus("error");
      setSubscribeError("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      CmsService.getPublicByName(FOOTER_ABOUT_CMS_NAME),
      CmsService.getPublicByName(FOOTER_NEWSLETTER_CMS_NAME),
    ]).then(([a, n]) => {
      if (!cancelled) {
        setAbout(a);
        setNewsletter(n);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const showAboutCms = about?.isActive === true && !!about.content?.trim();
  const newsletterActive = newsletter?.isActive === true;
  const newsletterHeading =
    newsletterActive && newsletter.title?.trim()
      ? newsletter.title.trim()
      : "Sign up for our Newsletter";
  const showNewsletterCmsBody = newsletterActive && !!newsletter.content?.trim();

  return (
    <footer className="mt-20 bg-white shadow-[3px_3px_10px_#BFBFBE]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-12 px-4 py-14 text-sm md:grid-cols-12 md:items-start md:gap-x-8 lg:gap-x-12">
        <div className="min-w-0 md:col-span-3">
          <Image
            src="/assets/images/footer_logo.png"
            alt="Feet by Foot"
            width={150}
            height={38}
            className="mb-4 h-auto w-[150px]"
          />
          {showAboutCms ? (
            <div
              className="footer-cms text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: about!.content }}
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">{DEFAULT_ABOUT}</p>
          )}
        </div>

        <div className="min-w-0 md:col-span-6">
          <FooterMenuColumns />
        </div>

        <div className="min-w-0 md:col-span-3">
          <h4 className="font-semibold mb-3 text-gray-900 text-lg">
            {newsletterHeading}
          </h4>
          {showNewsletterCmsBody ? (
            <div
              className="footer-cms text-gray-700 leading-relaxed mb-4 text-sm"
              dangerouslySetInnerHTML={{ __html: newsletter!.content }}
            />
          ) : (
            <p className="text-gray-700 leading-relaxed mb-4 text-sm">
              Get on the list and get 20% off your first order!
            </p>
          )}
        </div>
      </div>

      <Image
        src="/assets/images/footer_bottom.png"
        alt="Decorative Footer"
        width={1920}
        height={120}
        className="w-full h-auto"
      />

      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between gap-12 text-sm">
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
      </div>
    </footer>
  );
}

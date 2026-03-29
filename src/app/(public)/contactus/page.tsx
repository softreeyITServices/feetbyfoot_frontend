import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import { CmsService } from "@/domain/application/services/admin/cms.service";
import type { Metadata } from "next";
import { cache } from "react";
import ContactMessageForm from "./ContactMessageForm";

/** CMS is loaded on the server; avoid static shell so content and /api/cms calls stay fresh. */
export const dynamic = "force-dynamic";

/** Must match the CMS page name in Admin → CMS (underscores). Content = information column only (not the form). */
const CONTACT_US_CMS_NAME = "contact_us";

const getContactUsCms = cache(() =>
  CmsService.getPublicByName(CONTACT_US_CMS_NAME)
);

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getContactUsCms();
  const heading =
    cms?.isActive && cms.title?.trim() ? cms.title.trim() : "Contact Us";
  return { title: `${heading} | FeetByFoot` };
}

function DefaultContactInfo() {
  return (
    <>
      <h2 className="text-3xl font-semibold mb-6">Information</h2>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <img
            src="/icons/contact/phone.svg"
            width={16}
            height={16}
            alt=""
            className="shrink-0 w-4 h-4 block"
          />
          <p className="text-gray-800">+91-9896454666</p>
        </div>
        <div className="flex items-center gap-4">
          <img
            src="/icons/contact/email.svg"
            width={16}
            height={16}
            alt=""
            className="shrink-0 w-4 h-4 block"
          />
          <p className="text-gray-800">info@feetbyfoot.com</p>
        </div>
        <div className="flex items-start gap-4">
          <img
            src="/icons/contact/location.svg"
            width={16}
            height={16}
            alt=""
            className="shrink-0 w-4 h-4 block mt-0.5"
          />
          <p className="text-gray-800 leading-relaxed">
            2nd Floor, SCO 9, Eldeco County Rd, Sector 19,
            <br />
            Sonipat, Haryana 131001
          </p>
        </div>
      </div>
    </>
  );
}

export default async function ContactPage() {
  const cms = await getContactUsCms();
  const active = cms?.isActive === true;
  const html = cms?.content?.trim() ?? "";
  const bannerTitle =
    active && cms.title?.trim() ? cms.title.trim() : "Contact";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white py-16 px-6">
        <div className="text-center mb-10">
          <div className="inline-block bg-yellow-400 px-16 py-4">
            <h1 className="text-4xl font-bold text-black">{bannerTitle}</h1>
          </div>
          <p className="mt-4 text-gray-600">
            Preorder now to receive exclusive deals & gifts
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            {active && html ? (
              <div
                className="contact-info-cms"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <DefaultContactInfo />
            )}
          </div>

          <ContactMessageForm />
        </div>
      </div>

      <Footer />
    </>
  );
}

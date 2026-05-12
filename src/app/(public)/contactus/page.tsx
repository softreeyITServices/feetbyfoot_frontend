import { CmsService } from "@/domain/application/services/admin/cms.service";
import type { Metadata } from "next";
import { cache } from "react";
import ContactMessageForm from "./ContactMessageForm";

/** CMS is loaded on the server; avoid static shell so content and /cms calls stay fresh. */
export const dynamic = "force-dynamic";

/** Must match the CMS page name in Admin → CMS (underscores). Content = information column only (not the form). */
const CONTACT_US_CMS_NAME = "contact_us";

const getContactUsCms = cache(() =>
  CmsService.getPublicByName(CONTACT_US_CMS_NAME),
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
      <div className="min-h-screen bg-white py-16 px-6">
        <div className="text-center mb-10">
          <div className="inline-block bg-yellow-400 px-16 py-4">
            <h1 className="text-4xl font-bold text-black">{bannerTitle}</h1>
          </div>
          <p className="mt-4 text-gray-600">
            Preorder now to receive exclusive deals & gifts
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column: Info & Map */}
          <div className="space-y-10">
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

            {/* Concise Map Container */}
            <div className="relative group overflow-hidden rounded-2xl shadow-md border border-gray-100 h-[350px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3493.5818317765955!2d77.03154807550882!3d28.983424975475654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390db1711204859f%3A0xc00833a6b328905e!2sSCO%209%2C%20Sector%2019%2C%20Sonipat%2C%20Haryana%20131001!5e0!3m2!1sen!2sin!4v1715505300000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Location"
              ></iframe>
              
              {/* Concise Address Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-100 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-400 p-1.5 rounded-lg shrink-0">
                    <img src="/icons/contact/location.svg" width={12} height={12} alt="" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Our Office</p>
                    <p className="text-xs font-semibold text-gray-900 leading-tight">
                      SCO 9, Sector 19, Sonipat, Haryana
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div>
            <ContactMessageForm />
          </div>
        </div>
      </div>
    </>
  );
}

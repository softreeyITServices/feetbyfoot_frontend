import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import { CmsService } from "@/domain/application/services/admin/cms.service";
import type { Metadata } from "next";
import { cache } from "react";

/** Must match the CMS page name in Admin → CMS (underscores). */
const PRIVACY_POLICY_CMS_NAME = "privacy_policy";

const getPrivacyPolicyCms = cache(() =>
  CmsService.getPublicByName(PRIVACY_POLICY_CMS_NAME)
);

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getPrivacyPolicyCms();
  const heading =
    cms?.isActive && cms.title?.trim()
      ? cms.title.trim()
      : "Privacy Policy";
  return { title: `${heading} | FeetByFoot` };
}

export default async function PrivacyPolicyPage() {
  const cms = await getPrivacyPolicyCms();
  const active = cms?.isActive === true;
  const html = cms?.content?.trim() ?? "";
  const heading =
    active && cms.title?.trim() ? cms.title.trim() : "Privacy Policy";

  return (
    <>
      <Navbar />
      <main className="w-full bg-white">
        <div className="mx-auto px-4 pt-12 pb-1">
          <div className=" text-center mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
          </div>

          <section
            className="
            mx-auto
            w-full
            max-w-282.25
            border-gray-200
            bg-white
          "
          >
            {active && html ? (
              <div
                className="privacy-cms"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-sm text-gray-600">
                Privacy policy content is not available yet. Please check back
                later.
              </p>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

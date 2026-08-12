import { CmsService } from "@/domain/application/services/admin/cms.service";
import type { Metadata } from "next";
import { cache } from "react";

export const dynamic = "force-dynamic";

/** Must match the CMS page name in Admin → CMS (underscores). */
const TERMS_AND_CONDITIONS_CMS_NAME = "terms_conditions";

const getTermsAndConditionsCms = cache(() =>
  CmsService.getPublicByName(TERMS_AND_CONDITIONS_CMS_NAME)
);

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getTermsAndConditionsCms();
  const heading =
    cms?.isActive && cms.title?.trim()
      ? cms.title.trim()
      : "Terms and Conditions";
  return { title: `${heading} | FeetByFoot` };
}

export default async function TermsAndConditionsPage() {
  const cms = await getTermsAndConditionsCms();
  const active = cms?.isActive === true;
  const html = cms?.content?.trim() ?? "";
  const heading =
    active && cms.title?.trim()
      ? cms.title.trim()
      : "Terms and Conditions";

  return (
    <>
      <main className="w-full bg-white">
        <div className="mx-auto px-4 pt-12 pb-1">
          <div className="text-center mb-2">
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
                Terms and conditions are not available yet. Please check back
                later.
              </p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

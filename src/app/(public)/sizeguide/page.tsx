import { CmsService } from "@/domain/application/services/admin/cms.service";
import type { Metadata } from "next";
import { cache } from "react";

/** Must match the CMS page name in Admin → CMS (underscores). */
const SIZE_GUIDE_CMS_NAME = "size_guide";

const getSizeGuideCms = cache(() =>
  CmsService.getPublicByName(SIZE_GUIDE_CMS_NAME)
);

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getSizeGuideCms();
  const heading =
    cms?.isActive && cms.title?.trim()
      ? cms.title.trim()
      : "Find Your Perfect Fit";
  return { title: `${heading} | FeetByFoot` };
}

export default async function SizeGuidePage() {
  const cms = await getSizeGuideCms();
  const active = cms?.isActive === true;
  const html = cms?.content?.trim() ?? "";
  const heading =
    active && cms.title?.trim()
      ? cms.title.trim()
      : "Find Your Perfect Fit";

  return (
    <>
      <main className="w-full bg-white">
        <div className="mx-auto px-4 pt-12 pb-14">
          <div className="text-center mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
          </div>

          <section className="mx-auto w-full max-w-282.25 border-gray-200 bg-white">
            {active && html ? (
              <div
                className="size-guide-cms"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-sm text-gray-600">
                Size guide content is not available yet. Please check back later.
              </p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

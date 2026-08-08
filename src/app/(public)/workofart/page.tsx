import { CmsService } from "@/domain/application/services/admin/cms.service";
import type { Metadata } from "next";
import { cache } from "react";
import WorkOfArtStatic from "./WorkOfArtStatic";

/** Must match the CMS page name in Admin → CMS (underscores). Route: /workofart (About Us). */
const ABOUT_US_CMS_NAME = "about_us";

const getAboutUsCms = cache(() =>
  CmsService.getPublicByName(ABOUT_US_CMS_NAME)
);

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getAboutUsCms();
  const heading =
    cms?.isActive && cms.title?.trim()
      ? cms.title.trim()
      : "About Us";
  return { title: `${heading} | FeetByFoot` };
}

export default async function WorksOfArtPage() {
  const cms = await getAboutUsCms();
  const active = cms?.isActive === true;
  const html = cms?.content?.trim() ?? "";

  return (
    <>
      <main className="w-full overflow-x-hidden bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-3 sm:px-4 md:px-6 lg:px-8 py-10">
          {active && html ? (
            <div
              className="about-us-cms"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <WorkOfArtStatic />
          )}
        </div>
      </main>
    </>
  );
}

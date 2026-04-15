import { CmsService } from "@/domain/application/services/admin/cms.service";
import type { Metadata } from "next";
import { cache } from "react";

/** Must match the CMS page name in Admin → CMS (underscores). */
const FAQS_CMS_NAME = "faq";

const getFaqsCms = cache(() => CmsService.getPublicByName(FAQS_CMS_NAME));

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getFaqsCms();
  const heading =
    cms?.isActive && cms.title?.trim() ? cms.title.trim() : "FAQs";
  return { title: `${heading} | FeetByFoot` };
}

export default async function FAQsPage() {
  const cms = await getFaqsCms();
  const active = cms?.isActive === true;
  const html = cms?.content?.trim() ?? "";
  const heading =
    active && cms.title?.trim() ? cms.title.trim() : "FAQs";

  return (
    <>
      <main className="min-h-screen overflow-x-hidden bg-white">
        <section className="mx-auto w-full max-w-7xl px-4 py-14">
          <header className="text-center">
            <h1 className="inline-block bg-yellow-400 px-12 py-3 text-3xl font-bold text-black md:text-4xl">
              {heading}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-600 md:text-base">
              Quick answers to the most common questions about orders, shipping,
              returns, sizing, and support.
            </p>
          </header>

          {active && html ? (
            <div
              className="faq-cms"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="mx-auto mt-10 max-w-4xl text-sm text-gray-600">
              FAQ content is not available yet. Please check back later.
            </p>
          )}
        </section>
      </main>
    </>
  );
}

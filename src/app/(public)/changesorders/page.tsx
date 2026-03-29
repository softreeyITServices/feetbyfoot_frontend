import Navbar from "@/component/common/navbar";
import Footer from "@/component/common/Footer";
import { CmsService } from "@/domain/application/services/admin/cms.service";
import type { Metadata } from "next";
import { cache } from "react";

/** Must match the CMS page name in Admin → CMS (underscores). */
const CHANGES_TO_ORDERS_CMS_NAME = "changes_to_orders";

const getChangesToOrdersCms = cache(() =>
  CmsService.getPublicByName(CHANGES_TO_ORDERS_CMS_NAME)
);

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getChangesToOrdersCms();
  const heading =
    cms?.isActive && cms.title?.trim()
      ? cms.title.trim()
      : "Changes to Orders";
  return { title: `${heading} | FeetByFoot` };
}

export default async function ChangesToOrdersPage() {
  const cms = await getChangesToOrdersCms();
  const active = cms?.isActive === true;
  const html = cms?.content?.trim() ?? "";
  const heading =
    active && cms.title?.trim()
      ? cms.title.trim()
      : "Changes to Orders";

  return (
    <>
      <Navbar />
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
                Changes to orders content is not available yet. Please check back
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

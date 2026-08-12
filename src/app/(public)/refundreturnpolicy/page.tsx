import { CmsService } from "@/domain/application/services/admin/cms.service";
import type { Metadata } from "next";
import { cache } from "react";

/** Must match the CMS page name in Admin → CMS (underscores). */
export const dynamic = "force-dynamic";

const REFUND_RETURNS_POLICY_CMS_NAME = "refund_returns_policy";

const getRefundReturnsPolicyCms = cache(() =>
  CmsService.getPublicByName(REFUND_RETURNS_POLICY_CMS_NAME)
);

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getRefundReturnsPolicyCms();
  const heading =
    cms?.isActive && cms.title?.trim()
      ? cms.title.trim()
      : "Refund & Returns Policy";
  return { title: `${heading} | FeetByFoot` };
}

export default async function RefundAndReturnsPage() {
  const cms = await getRefundReturnsPolicyCms();
  const active = cms?.isActive === true;
  const html = cms?.content?.trim() ?? "";
  const heading =
    active && cms.title?.trim()
      ? cms.title.trim()
      : "Refund & Returns Policy";

  return (
    <>
      <main className="w-full overflow-x-hidden bg-white">
        <section className="px-4 pt-12 pb-16">
          <div className="mx-auto max-w-282.25 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
          </div>
        </section>

        {active && html ? (
          <div
            className="refund-cms"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="px-4 pb-20">
            <p className="mx-auto max-w-282.25 text-sm text-gray-600">
              Refund and returns policy content is not available yet. Please
              check back later.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

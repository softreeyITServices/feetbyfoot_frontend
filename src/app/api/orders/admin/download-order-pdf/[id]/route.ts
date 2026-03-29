import { apiHandler, ExternalApiError } from "@/lib/apiHandler";
import { exOrderAdminSingleDownloadPdfUrl } from "@/constants/apis";
import { NextRequest, NextResponse } from "next/server";
import { ApiContext } from "@/domain/shared/types/apiResponse.type";

export const GET = apiHandler(
  async (req: NextRequest, context: ApiContext<unknown, { id: string }>) => {
    const authorization = req.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        { message: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const id = context.params?.id;
    if (!id) {
      return NextResponse.json({ message: "Missing order id" }, { status: 400 });
    }

    const upstreamUrl = exOrderAdminSingleDownloadPdfUrl(id);
    if (!upstreamUrl.startsWith("http")) {
      throw new ExternalApiError(
        "API_URL is not configured",
        500,
        undefined
      );
    }

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: { Authorization: authorization },
    });

    if (!upstream.ok) {
      let message = "Failed to download PDF";
      const ct = upstream.headers.get("content-type") ?? "";
      try {
        if (ct.includes("application/json")) {
          const j: unknown = await upstream.json();
          if (
            typeof j === "object" &&
            j !== null &&
            "message" in j &&
            typeof (j as { message: unknown }).message === "string"
          ) {
            message = (j as { message: string }).message;
          }
        } else {
          const t = await upstream.text();
          if (t) message = t.slice(0, 300);
        }
      } catch {
        /* keep default message */
      }
      throw new ExternalApiError(message, upstream.status, undefined);
    }

    const body = await upstream.arrayBuffer();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    const cd = upstream.headers.get("content-disposition");
    if (cd) {
      headers.set("Content-Disposition", cd);
    }

    return new NextResponse(body, { status: 200, headers });
  },
  { allowedMethods: ["GET"] }
);

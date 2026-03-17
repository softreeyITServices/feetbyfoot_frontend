import { GetProductsQuery, ProductListResponse } from "@/domain/shared/types/admin/product";


export async function getProducts(
  query?: GetProductsQuery,
  token?: string
): Promise<ProductListResponse> {
  const params = new URLSearchParams();

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}
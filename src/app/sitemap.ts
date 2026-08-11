import type { MetadataRoute } from "next";
import { productService } from "@/domain/application/services/product.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://laviors.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic product routes
  try {
    const productsRes = await productService.getPublicProducts({ limit: 100 });
    const products = productsRes?.products || [];

    const productRoutes: MetadataRoute.Sitemap = products.map((product: any) => {
      const categorySlug = product.category?.slug || "footwear";
      const productSlug = product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "product";

      return {
        url: `${baseUrl}/${categorySlug}/${productSlug}/${product._id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating sitemap products:", error);
    return staticRoutes;
  }
}

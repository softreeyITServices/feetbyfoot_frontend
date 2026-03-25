import { redirect } from "next/navigation";

type EditBlogRedirectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogRedirectPage({
  params,
}: EditBlogRedirectPageProps) {
  const { id } = await params;
  redirect(`/admin/blogs/create?blogId=${id}`);
}

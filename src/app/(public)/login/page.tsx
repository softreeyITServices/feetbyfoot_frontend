import { authOptions } from "@/app/services/auth/[...nextauth]/route";
import AuthLayout from "@/component/auth/AuthLayout";
import LoginForm from "@/component/auth/LoginForm";
import RegisterForm from "@/component/auth/RegisterForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

const getSafeRedirectPath = (value?: string): string => {
  if (!value) return "/account";
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const redirectPath = getSafeRedirectPath(resolvedSearchParams?.redirect);

  if (session?.accessToken) {
    redirect(redirectPath);
  }

  return (
    <AuthLayout title="My Account">
      <LoginForm />
      <RegisterForm />
    </AuthLayout>
  );
}

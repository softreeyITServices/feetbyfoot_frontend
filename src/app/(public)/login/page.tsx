import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AuthLayout from "@/component/auth/AuthLayout";
import LoginForm from "@/component/auth/LoginForm";
import RegisterForm from "@/component/auth/RegisterForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.accessToken) {
    redirect("/account");
  }

  return (
    <AuthLayout title="My Account">
      <LoginForm />
      <RegisterForm />
    </AuthLayout>
  );
}

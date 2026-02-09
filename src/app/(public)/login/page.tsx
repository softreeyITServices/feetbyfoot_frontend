import AuthLayout from "@/component/auth/AuthLayout";
import LoginForm from "@/component/auth/LoginForm";
import RegisterForm from "@/component/auth/RegisterForm";

export default function LoginPage() {
  return (
      <AuthLayout title="My Account">
        <LoginForm />
        <RegisterForm />
      </AuthLayout>
  );
}

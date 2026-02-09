import Button from "../ui/Button";
import Input from "../ui/Input";


export default function LoginForm() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Login</h2>

      <Input
        label="Mobile or email address"
        required
        type="text"
      />

      <Input
        label="OTP"
        required
        type="text"
      />

      <div className="flex items-center gap-2 text-sm">
        <input type="checkbox" />
        <span>Remember me</span>
      </div>

      <Button>Log In</Button>
    </div>
  );
}

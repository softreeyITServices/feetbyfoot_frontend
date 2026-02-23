"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { authService } from "@/domain/application/services/auth.service";
import { signIn } from "next-auth/react";
import { validate, ValidType } from "@/lib/emailPhoneValidator";

export default function LoginForm() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authType, setAuthType] = useState<ValidType | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!otpSent || timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleIndentifier = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const type = validate(value);
    if (type === 'email') {
      setAuthType('email')
    } else {
      setAuthType('phone')
    }
    setIdentifier(value);
    setError("");

  }

  const handleSendOtp = async () => {
    if (!identifier) {
      setError("Please enter your email or phone number");
      return;
    }
    if (!authType) {
      setError("Please enter a valid email or phone number");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await authService.sendOtp({
        identifier,
        type: authType,
      });

      setOtpSent(true);
      setTimer(60);
      setSuccess("OTP sent successfully! Check your email.");
    } catch (err: unknown) {
      console.error("Send OTP failed", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if(!authType) return;

      await authService.sendOtp({
        identifier,
        type: authType,
      });

      setTimer(60);
      setSuccess("OTP resent successfully!");
    } catch (err: unknown) {
      console.error("Resend OTP failed", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!identifier || !otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await signIn("credentials", {
        identifier,
        otp,
        type: authType,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid or expired OTP. Please try again.");
        } else {
          setError("Authentication failed. Please try again.");
        }
        return;
      }

      if (result?.ok) {
        setSuccess("Login successful! Redirecting...");

        setTimeout(() => {
          router.push("/account");
          router.refresh();
        }, 1000);
      }
    } catch (err: unknown) {
      console.error("OTP verification failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setSuccess("");
    setTimer(60);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Login</h2>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          {success}
        </div>
      )}

      <Input
        label="Mobile or email address"
        required
        type="text"
        value={identifier}
        onChange={handleIndentifier}
        disabled={otpSent}
      />

      {!otpSent && (
        <Button onClick={handleSendOtp} disabled={loading || !identifier}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </Button>
      )}

      {otpSent && (
        <>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>OTP sent to {identifier}</span>
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-blue-600 hover:underline"
            >
              Change
            </button>
          </div>

          <Input
            label="Enter OTP"
            required
            type="text"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError("");
            }}
            maxLength={6}
            placeholder="Enter 6-digit OTP"
          />

          <Button
            onClick={handleVerifyOtp}
            disabled={loading || otp.length < 6}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-sm text-gray-500">
            {timer > 0 ? (
              <span>Resend OTP in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-blue-600 hover:underline font-medium"
                disabled={loading}
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

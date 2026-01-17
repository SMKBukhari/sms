import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Schola",
  description: "Login to your Schola account",
};

export default function LoginPage() {
  return <LoginForm />;
}

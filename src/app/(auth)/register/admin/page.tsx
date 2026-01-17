import { RegisterForm } from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Admin - Schola",
  description: "Create your Schola Admin account",
};

export default function RegisterAdminPage() {
  return <RegisterForm />;
}

import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | PostgreSQL Manager",
  description: "Login para o sistema de gerenciamento de PostgreSQL",
};

export default function LoginPage() {
  return <LoginForm />;
}

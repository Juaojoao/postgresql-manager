import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login | PostgreSQL Manager",
  description: "Login para o sistema de gerenciamento de PostgreSQL",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}

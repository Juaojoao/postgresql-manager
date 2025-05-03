"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debug, setDebug] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verificar se há erro na URL ao carregar o componente
  useEffect(() => {
    const errorType = searchParams?.get("error");
    if (errorType) {
      switch (errorType) {
        case "CredentialsSignin":
          setError(
            "Credenciais inválidas. Por favor, verifique seu email e senha."
          );
          break;
        case "true":
          setError("Ocorreu um erro na autenticação. Tente novamente.");
          break;
        default:
          setError(`Erro de autenticação: ${errorType}`);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setDebug("");

    try {
      // Usando o mecanismo de autenticação
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!result?.ok) {
        setError("Credenciais inválidas. Por favor, tente novamente.");
        setDebug(result?.error || "Erro não especificado");
        console.error("Falha na autenticação:", result?.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError("Ocorreu um erro ao processar o login.");
      setDebug(`Erro técnico: ${errorMessage}`);
      console.error("Erro técnico:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 p-4 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full border-t-2 border-emerald-500 text-gray-100 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center  text-teal-600">
          PostgreSQL Manager
        </h1>

        <h2 className="text-xl mb-4 text-center">Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
            {debug && (
              <pre className="mt-2 text-xs overflow-x-auto">{debug}</pre>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-teal-500/10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              placeholder="seu@email.com"
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-teal-500/10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              placeholder="********"
              autoComplete="current-password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-teal-400"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Sistema de gerenciamento de bancos de dados PostgreSQL
        </p>
      </div>
    </div>
  );
}

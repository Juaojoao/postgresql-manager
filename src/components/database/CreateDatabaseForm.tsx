"use client";

import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";

export default function CreateDatabaseForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [databaseName, setDatabaseName] = useState("");
  const [loading, setLoading] = useState(false);
  const notification = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!databaseName.trim()) {
      notification.error("O nome do banco de dados é obrigatório");
      return;
    }

    // Validar nome do banco de dados (apenas letras, números e underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
      notification.error(
        "Nome do banco de dados inválido. Use apenas letras, números e underscores."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/database/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: databaseName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar banco de dados");
      }

      await response.json();
      notification.success(
        `Banco de dados '${databaseName}' criado com sucesso!`
      );
      setDatabaseName("");

      // Chamar função de callback se fornecida
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      notification.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md shadow-gray-900/50 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">
        Criar Novo Banco de Dados
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="databaseName"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Nome do Banco de Dados
          </label>
          <input
            type="text"
            id="databaseName"
            value={databaseName}
            onChange={(e) => setDatabaseName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="meu_banco_de_dados"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-400">
            Use apenas letras, números e underscores (_).
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-teal-800 disabled:text-gray-300"
        >
          {loading ? "Criando..." : "Criar Banco de Dados"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationContext";

export default function BackupForm({ onSuccess }: { onSuccess?: () => void }) {
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDatabases, setLoadingDatabases] = useState(true);
  const [loadingTables, setLoadingTables] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backupSize, setBackupSize] = useState<number | null>(null);
  const notification = useNotification();

  // Função auxiliar para exibir toast a partir da resposta da API
  const showToastFromResponse = (toast: { type: string; message: string }) => {
    const toastType = toast.type as "success" | "error" | "info" | "warning";
    switch (toastType) {
      case "success":
        notification.success(toast.message);
        break;
      case "error":
        notification.error(toast.message);
        break;
      case "info":
        notification.info(toast.message);
        break;
      case "warning":
        notification.warning(toast.message);
        break;
      default:
        notification.info(toast.message);
    }
  };

  useEffect(() => {
    async function fetchDatabases() {
      try {
        const response = await fetch("/api/database/list");
        if (!response.ok) {
          throw new Error("Falha ao carregar bancos de dados");
        }
        const data = await response.json();
        setDatabases(data.databases || []);

        // Exibir toast se existir na resposta
        if (data.toast) {
          showToastFromResponse(data.toast);
        }
      } catch (err: any) {
        notification.error(err.message);
      } finally {
        setLoadingDatabases(false);
      }
    }
    fetchDatabases();
  }, []);

  useEffect(() => {
    if (!selectedDatabase) return;

    async function fetchTables() {
      setLoadingTables(true);
      try {
        const response = await fetch(
          `/api/database/tables?db=${selectedDatabase}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Falha ao carregar tabelas do banco de dados"
          );
        }
        const data = await response.json();
        setTables(data.tables || []);

        // Exibir toast se existir na resposta
        if (data.toast) {
          showToastFromResponse(data.toast);
        }
      } catch (err: any) {
        notification.error(err.message);
      } finally {
        setLoadingTables(false);
      }
    }
    fetchTables();
  }, [selectedDatabase]);

  // Função para verificar o status do backup
  const checkBackupStatus = async (backupId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/database/backup/status?id=${backupId}`
      );
      if (!response.ok) {
        const errorData = await response.json();

        // Exibir toast de erro se existir na resposta
        if (errorData.toast) {
          showToastFromResponse(errorData.toast);
        }

        return false;
      }

      const data = await response.json();

      // Exibir toast se existir na resposta
      if (data.toast) {
        showToastFromResponse(data.toast);
      }

      if (data.completed) {
        setBackupSize(data.size || 0);
        return true;
      }

      // Atualiza o progresso
      if (data.progress) {
        setProgress(data.progress);
      }

      return false;
    } catch (error: any) {
      console.error("Erro ao verificar status do backup:", error);
      notification.error(`Erro ao verificar status: ${error.message}`);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatabase) {
      notification.error("Selecione um banco de dados");
      return;
    }
    setLoading(true);
    setProgress(0);
    setBackupSize(null);

    try {
      // Inicia o backup
      const response = await fetch("/api/database/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ databaseName: selectedDatabase }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Exibir toast de erro se existir na resposta
        if (data.toast) {
          showToastFromResponse(data.toast);
        } else {
          throw new Error(
            data.error || "Erro ao fazer backup do banco de dados"
          );
        }
        return;
      }

      // Exibir toast se existir na resposta
      if (data.toast) {
        showToastFromResponse(data.toast);
      } else {
        notification.info("Backup em andamento. Por favor, aguarde...");
      }

      const backupId = data.backup?.id;

      if (backupId) {
        // Inicia a verificação de status do backup
        let isCompleted = false;
        let attempts = 0;
        const maxAttempts = 60; // 60 tentativas (30 segundos no total)

        while (!isCompleted && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 500)); // Aguarda 500ms
          isCompleted = await checkBackupStatus(backupId);
          attempts++;
        }

        if (isCompleted) {
          const sizeInMb = backupSize
            ? (backupSize / (1024 * 1024)).toFixed(2)
            : "?";
          if (!data.toast) {
            // Só exibe se não exibiu antes
            notification.success(
              `Backup concluído com sucesso: ${
                data.backup?.filename || "backup.sql"
              } (${sizeInMb} MB)`
            );
          }

          // Adiciona um atraso antes de redirecionar para permitir que o usuário veja a notificação
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 1500);
        } else {
          notification.warning(
            "O backup foi iniciado, mas não pudemos confirmar sua conclusão. Verifique a lista de backups."
          );

          // Adiciona um atraso antes de redirecionar para permitir que o usuário veja a notificação
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 1500);
        }
      } else {
        if (!data.toast) {
          // Só exibe se não exibiu antes
          notification.success(
            `Backup iniciado: ${data.backup?.filename || "backup.sql"}`
          );
        }

        // Adiciona um atraso antes de redirecionar para permitir que o usuário veja a notificação
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      notification.error(err.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md shadow-gray-900/50 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">
        Criar Backup de Banco de Dados
      </h2>
      {loadingDatabases ? (
        <div className="flex justify-center items-center p-8 text-gray-200">
          <div className="w-8 h-8 border-t-4 border-b-4 border-teal-500 rounded-full animate-spin"></div>
          <p className="ml-2">Carregando bancos de dados...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="databaseSelect"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Selecione o Banco de Dados
            </label>
            {databases.length === 0 ? (
              <p className="text-gray-400">
                Não há bancos de dados disponíveis.
              </p>
            ) : (
              <select
                id="databaseSelect"
                value={selectedDatabase}
                onChange={(e) => setSelectedDatabase(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              >
                <option value="">-- Selecione um banco de dados --</option>
                {databases.map((db) => (
                  <option key={db} value={db}>
                    {db}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Indicador de progresso */}
          {loading && progress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-teal-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {progress}% concluído
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || databases.length === 0}
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-teal-800 disabled:text-gray-300"
          >
            {loading ? "Criando Backup..." : "Criar Backup"}
          </button>

          <p className="mt-2 text-sm text-gray-400">
            O arquivo de backup será criado no diretório configurado do
            servidor.
          </p>
        </form>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationContext";

type BackupFile = {
  filename: string;
  size: number;
  createdAt: string;
};

export default function RestoreForm({ onSuccess }: { onSuccess?: () => void }) {
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [targetName, setTargetName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [progress, setProgress] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<number | null>(
    null
  );
  const notification = useNotification();

  // Carregar a lista de arquivos de backup disponíveis
  useEffect(() => {
    async function fetchBackups() {
      try {
        const response = await fetch("/api/database/list-backups");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Falha ao carregar arquivos de backup"
          );
        }

        const data = await response.json();
        setBackupFiles(data.backups || []);

        // Exibir toast se existir na resposta
        if (data.toast) {
          // Usar abordagem condicional em vez de notação de colchetes
          const toastType = data.toast.type as
            | "success"
            | "error"
            | "info"
            | "warning";
          switch (toastType) {
            case "success":
              notification.success(data.toast.message);
              break;
            case "error":
              notification.error(data.toast.message);
              break;
            case "info":
              notification.info(data.toast.message);
              break;
            case "warning":
              notification.warning(data.toast.message);
              break;
            default:
              notification.info(data.toast.message);
          }
        }
      } catch (err: any) {
        notification.error(err.message);
      } finally {
        setLoadingBackups(false);
      }
    }

    fetchBackups();
  }, []);

  // Extrair o nome do banco de dados do nome do arquivo de backup
  useEffect(() => {
    if (selectedFile) {
      // Assumindo o formato: nomedobanco_YYYY-MM-DDThh-mm-ss-mmmZ.backup
      const dbName = selectedFile.split("_")[0];
      setTargetName(dbName);
    }
  }, [selectedFile]);

  // Função para simular o progresso da restauração
  const simulateRestoreProgress = () => {
    const startTime = Date.now();
    const totalDuration = 10000; // 10 segundos estimados para conclusão

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(
        Math.floor((elapsed / totalDuration) * 100),
        95
      );

      // Estimativa de tempo restante
      if (newProgress > 0) {
        const timePerPercent = elapsed / newProgress;
        const remainingPercent = 100 - newProgress;
        const estimatedRemaining = Math.ceil(
          (timePerPercent * remainingPercent) / 1000
        );
        setEstimatedTimeLeft(estimatedRemaining);
      }

      setProgress(newProgress);

      if (elapsed >= totalDuration) {
        clearInterval(interval);
      }
    }, 200);

    return interval;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      notification.error("Selecione um arquivo de backup");
      return;
    }

    if (!targetName.trim()) {
      notification.error("O nome do banco de dados de destino é obrigatório");
      return;
    }

    // Validar nome do banco de dados (apenas letras, números e underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(targetName)) {
      notification.error(
        "Nome do banco de dados inválido. Use apenas letras, números e underscores."
      );
      return;
    }

    setLoading(true);
    setProgress(0);
    setEstimatedTimeLeft(null);

    // Iniciar simulação de progresso
    const progressInterval = simulateRestoreProgress();

    try {
      const response = await fetch("/api/database/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          databaseName: targetName,
          backupFileName: selectedFile,
        }),
      });

      clearInterval(progressInterval);

      const data = await response.json();

      if (!response.ok) {
        // Se houver erro, exibir a mensagem do toast da API ou criar um erro com a mensagem padrão
        if (data.toast) {
          // Usar abordagem condicional em vez de notação de colchetes
          const toastType = data.toast.type as
            | "success"
            | "error"
            | "info"
            | "warning";
          switch (toastType) {
            case "success":
              notification.success(data.toast.message);
              break;
            case "error":
              notification.error(data.toast.message);
              break;
            case "info":
              notification.info(data.toast.message);
              break;
            case "warning":
              notification.warning(data.toast.message);
              break;
            default:
              notification.error(data.toast.message);
          }
        } else {
          notification.error(
            data.error || "Erro ao restaurar o banco de dados"
          );
        }
        return;
      }

      // Em caso de sucesso, exibir a mensagem do toast da API ou a mensagem padrão
      if (data.toast) {
        // Usar abordagem condicional em vez de notação de colchetes
        const toastType = data.toast.type as
          | "success"
          | "error"
          | "info"
          | "warning";
        switch (toastType) {
          case "success":
            notification.success(data.toast.message);
            break;
          case "error":
            notification.error(data.toast.message);
            break;
          case "info":
            notification.info(data.toast.message);
            break;
          case "warning":
            notification.warning(data.toast.message);
            break;
          default:
            notification.success(data.toast.message);
        }
      } else {
        notification.success(
          `Banco de dados '${targetName}' restaurado com sucesso!`
        );
      }

      setProgress(100);

      // Adicionar um atraso antes de redirecionar para dar tempo de exibir a notificação
      setTimeout(() => {
        // Chamar função de callback se fornecida
        if (onSuccess) {
          onSuccess();
        }
      }, 1500); // Atraso de 1,5 segundos
    } catch (err: any) {
      clearInterval(progressInterval);
      notification.error(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 2000); // Resetar progresso após 2 segundos
    }
  };

  // Formatar o tamanho do arquivo para exibição
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Formatar a data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md shadow-gray-900/50 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">
        Restaurar Banco de Dados
      </h2>

      {loadingBackups ? (
        <div className="flex justify-center items-center p-8 text-gray-200">
          <div className="w-8 h-8 border-t-4 border-b-4 border-teal-500 rounded-full animate-spin"></div>
          <p className="ml-2">Carregando backups disponíveis...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="backupFile"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Selecione o Backup
            </label>
            {backupFiles.length === 0 ? (
              <p className="text-gray-400">
                Não há arquivos de backup disponíveis.
              </p>
            ) : (
              <select
                id="backupFile"
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              >
                <option value="">-- Selecione um arquivo de backup --</option>
                {backupFiles.map((file) => (
                  <option key={file.filename} value={file.filename}>
                    {file.filename} ({formatFileSize(file.size)}) -{" "}
                    {formatDate(file.createdAt)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label
              htmlFor="targetName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Nome do Banco de Dados de Destino
            </label>
            <input
              type="text"
              id="targetName"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="nome_do_banco"
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-400">
              Se o banco de dados já existir, seus dados serão substituídos.
            </p>
          </div>

          {/* Indicador de progresso */}
          {progress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-teal-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                <span>{progress}% concluído</span>
                {estimatedTimeLeft && progress < 100 && (
                  <span>
                    Aproximadamente {estimatedTimeLeft} segundo
                    {estimatedTimeLeft !== 1 ? "s" : ""} restante
                    {estimatedTimeLeft !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || backupFiles.length === 0}
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors disabled:bg-teal-800 disabled:text-gray-300"
          >
            {loading ? "Restaurando..." : "Restaurar Banco de Dados"}
          </button>
        </form>
      )}
    </div>
  );
}

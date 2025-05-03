"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";

type Database = {
  name: string;
};

export default function DatabaseList() {
  const [databases, setDatabases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        const res = await fetch("/api/database/list");

        if (!res.ok) {
          throw new Error("Falha ao carregar bancos de dados");
        }

        const data = await res.json();
        setDatabases(data.databases);

        // Exibir toast se existir na resposta
        if (data.toast) {
          showToastFromResponse(data.toast);
        }
      } catch (err: any) {
        notification.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDatabases();
  }, []);

  const handleBackup = async (dbName: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/database/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ databaseName: dbName }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.toast) {
          showToastFromResponse(data.toast);
        } else {
          throw new Error(data.error || "Falha ao criar backup");
        }
        return;
      }

      // Exibir toast se existir na resposta
      if (data.toast) {
        showToastFromResponse(data.toast);
      } else {
        notification.success(
          `Backup criado com sucesso: ${data.backup?.filename || "backup.sql"}`
        );
      }
    } catch (err: any) {
      notification.error(`Erro ao fazer backup: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dbName: string) => {
    setSelectedDb(dbName);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDb) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/database/delete?name=${selectedDb}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.toast) {
          showToastFromResponse(data.toast);
        } else {
          throw new Error(data.error || "Falha ao excluir banco de dados");
        }
        return;
      }

      // Exibir toast se existir na resposta
      if (data.toast) {
        showToastFromResponse(data.toast);
      } else {
        notification.success(
          `Banco de dados '${selectedDb}' excluído com sucesso`
        );
      }

      setDatabases(databases.filter((db) => db !== selectedDb));
      setShowDeleteModal(false);
    } catch (err: any) {
      notification.error(`Erro ao excluir banco de dados: ${err.message}`);
    } finally {
      setLoading(false);
      setSelectedDb(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 text-gray-200">
        <div className="w-8 h-8 border-t-4 border-b-4 border-teal-500 rounded-full animate-spin"></div>
        <p className="ml-2">Carregando bancos de dados...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md shadow-gray-900/50 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">
        Bancos de Dados PostgreSQL
      </h2>

      {databases.length === 0 ? (
        <p className="text-gray-400">Nenhum banco de dados encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Nome
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {databases.map((db) => (
                <tr key={db} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-200">
                      {db}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleBackup(db)}
                      className="text-teal-400 hover:text-teal-300 mr-4"
                      disabled={loading}
                    >
                      Backup
                    </button>
                    <button
                      onClick={() => handleDelete(db)}
                      className="text-red-400 hover:text-red-300"
                      disabled={loading}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-gray-100">
              Confirmar exclusão
            </h3>
            <p className="mb-6 text-gray-300">
              Tem certeza que deseja excluir o banco de dados{" "}
              <strong className="text-white">{selectedDb}</strong>?
              <br />
              <span className="text-red-400">
                Esta ação não pode ser desfeita!
              </span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

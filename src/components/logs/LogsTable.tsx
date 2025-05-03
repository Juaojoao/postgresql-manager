"use client";

import { useState, useEffect } from "react";

type Log = {
  id: number;
  action: string;
  message: string;
  createdAt: string;
  database: {
    name: string;
  };
};

type PaginationInfo = {
  total: number;
  limit: number;
  offset: number;
};

export default function LogsTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 10,
    offset: 0,
  });
  const [filter, setFilter] = useState<{
    action: string | null;
    databaseId: string | null;
  }>({
    action: null,
    databaseId: null,
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null); // Reset errors on each fetch attempt

      let url = `/api/logs?limit=${pagination.limit}&offset=${pagination.offset}`;

      if (filter.action) {
        url += `&action=${filter.action}`;
      }

      if (filter.databaseId) {
        url += `&databaseId=${filter.databaseId}`;
      }

      console.log("Buscando logs:", url);
      const res = await fetch(url);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Erro ${res.status}: Falha ao carregar logs`
        );
      }

      const data = await res.json();

      if (!data.logs || !Array.isArray(data.logs)) {
        console.error("Formato inválido de resposta:", data);
        throw new Error("Formato de resposta inválido do servidor");
      }

      console.log(`Logs carregados: ${data.logs.length}`);
      setLogs(data.logs);
      setPagination(
        data.pagination || {
          total: 0,
          limit: pagination.limit,
          offset: pagination.offset,
        }
      );
    } catch (err: any) {
      console.error("Erro ao carregar logs:", err);
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.offset, pagination.limit, filter]);

  const handlePageChange = (newOffset: number) => {
    setPagination((prev) => ({
      ...prev,
      offset: newOffset,
    }));
  };

  const handleFilterChange = (
    field: "action" | "databaseId",
    value: string | null
  ) => {
    setFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPagination((prev) => ({
      ...prev,
      offset: 0,
    }));
  };

  // Formatar a data para exibição no formato brasileiro
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Cores para cada tipo de ação
  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    BACKUP: "bg-teal-100 text-teal-800",
    RESTORE: "bg-yellow-100 text-yellow-800",
    DELETE: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">
          Logs do Sistema
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          <div className="w-full sm:w-1/3">
            <label
              htmlFor="actionFilter"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Filtrar por Ação
            </label>
            <select
              id="actionFilter"
              value={filter.action || ""}
              onChange={(e) =>
                handleFilterChange("action", e.target.value || null)
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Todas as ações</option>
              <option value="CREATE">Criação</option>
              <option value="BACKUP">Backup</option>
              <option value="RESTORE">Restauração</option>
              <option value="DELETE">Exclusão</option>
            </select>
          </div>

          <div className="w-full sm:w-1/3">
            <label
              htmlFor="limitFilter"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Registros por página
            </label>
            <select
              id="limitFilter"
              value={pagination.limit}
              onChange={(e) =>
                setPagination((prev) => ({
                  ...prev,
                  limit: Number(e.target.value),
                  offset: 0,
                }))
              }
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={() => fetchLogs()}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600"
          >
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="m-6 p-3 bg-red-900/30 text-red-300 rounded-lg border border-red-700">
          <p>Erro: {error}</p>
          <button
            onClick={() => fetchLogs()}
            className="mt-2 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-8 text-gray-300">
          <div className="w-8 h-8 border-t-4 border-b-4 border-teal-500 rounded-full animate-spin"></div>
          <p className="ml-2">Carregando logs...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Data/Hora
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Ação
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Banco de Dados
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Descrição
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      Nenhum log encontrado.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            log.action === "CREATE"
                              ? "bg-green-900/50 text-green-300"
                              : log.action === "BACKUP"
                              ? "bg-teal-900/50 text-teal-300"
                              : log.action === "RESTORE"
                              ? "bg-yellow-900/50 text-yellow-300"
                              : log.action === "DELETE"
                              ? "bg-red-900/50 text-red-300"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {log.action === "CREATE" && "Criação"}
                          {log.action === "BACKUP" && "Backup"}
                          {log.action === "RESTORE" && "Restauração"}
                          {log.action === "DELETE" && "Exclusão"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {log.database?.name || "(desconhecido)"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-200">
                        {log.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700">
            <div>
              <p className="text-sm text-gray-300">
                Mostrando{" "}
                <span className="font-medium">{pagination.offset + 1}</span> a{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.offset + pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                de <span className="font-medium">{pagination.total}</span>{" "}
                registros
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() =>
                  handlePageChange(
                    Math.max(0, pagination.offset - pagination.limit)
                  )
                }
                disabled={pagination.offset === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  handlePageChange(pagination.offset + pagination.limit)
                }
                disabled={
                  pagination.offset + pagination.limit >= pagination.total
                }
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import DatabaseList from "@/components/database/DatabaseList";
import CreateDatabaseForm from "@/components/database/CreateDatabaseForm";
import RestoreForm from "@/components/database/RestoreForm";
import BackupForm from "@/components/database/BackupForm";

export default function DatabasesPage() {
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "restore" | "backup"
  >("list");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshList = () => {
    setRefreshTrigger((prev) => prev + 1);
    setCurrentView("list");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-100">
          Gerenciamento de Bancos de Dados
        </h1>
        <p className="text-gray-300 mb-4">
          Crie, faça backup, restaure e gerencie seus bancos de dados
          PostgreSQL.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md shadow-gray-900/50 mb-6">
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentView("list")}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentView === "list"
                  ? "bg-teal-600  text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              Listar Bancos
            </button>

            <button
              onClick={() => setCurrentView("create")}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentView === "create"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              Criar Banco
            </button>

            <button
              onClick={() => setCurrentView("backup")}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentView === "backup"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              Criar Backup
            </button>

            <button
              onClick={() => setCurrentView("restore")}
              className={`px-4 py-2 rounded-md transition-colors ${
                currentView === "restore"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              Restaurar Backup
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {currentView === "list" && <DatabaseList key={refreshTrigger} />}

        {currentView === "create" && (
          <CreateDatabaseForm onSuccess={refreshList} />
        )}

        {currentView === "backup" && <BackupForm onSuccess={refreshList} />}

        {currentView === "restore" && <RestoreForm onSuccess={refreshList} />}
      </div>
    </div>
  );
}

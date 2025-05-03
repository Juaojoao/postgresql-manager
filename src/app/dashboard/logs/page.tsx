import { Metadata } from "next";
import LogsTable from "@/components/logs/LogsTable";

export const metadata: Metadata = {
  title: "Logs | PostgreSQL Manager",
  description: "Visualizar histórico de operações do sistema",
};

export default function LogsPage() {
  return (
    <div className="bg-gray-900">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-100">
          Histórico de Operações
        </h1>
        <p className="mt-2 text-gray-400">
          Visualize todas as operações realizadas no sistema, como criação,
          backup, restauração e exclusão de bancos de dados.
        </p>
      </div>

      <LogsTable />
    </div>
  );
}

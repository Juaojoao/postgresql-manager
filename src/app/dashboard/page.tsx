import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | PostgreSQL Manager",
  description:
    "Painel de controle para gerenciamento de bancos de dados PostgreSQL",
};

export default function DashboardPage() {
  // Data atual formatada
  const dataAtual = "2 de maio de 2025";

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <div className="mt-3 md:mt-0 flex space-x-2">
          <span className="bg-gray-800 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-700 flex items-center">
            <div className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse"></div>
            Sistema Online
          </span>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Card de Visão Geral */}
        <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-t-2 border-teal-500">
          <div className="bg-gray-750 px-4 py-3 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100">Visão Geral</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center">
              <div className="p-3 bg-gray-700 rounded-full">
                <svg
                  className="w-7 h-7 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-100">
                  PostgreSQL 15.0
                </h3>
                <p className="text-gray-400">Servidor ativo e operacional</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Bancos de Dados */}
        <Link href="/dashboard/databases" className="block">
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full border-t-2 border-purple-500">
            <div className="bg-gray-750 px-4 py-3 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-gray-100">
                Gerenciar Bancos de Dados
              </h2>
            </div>
            <div className="p-5">
              <div className="flex items-center">
                <div className="p-3 bg-gray-700 rounded-full">
                  <svg
                    className="w-7 h-7 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-400">
                    Criar, listar, fazer backup e restaurar bancos de dados
                    PostgreSQL
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Card de Logs */}
        <Link href="/dashboard/logs" className="block">
          <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full border-t-2 border-emerald-500">
            <div className="bg-gray-750 px-4 py-3 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-gray-100">
                Logs do Sistema
              </h2>
            </div>
            <div className="p-5">
              <div className="flex items-center">
                <div className="p-3 bg-gray-700 rounded-full">
                  <svg
                    className="w-7 h-7 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-400">
                    Visualizar histórico de operações de criação, backup e
                    restauração
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Seção de Informações do Sistema */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-100 border-b border-gray-700 pb-2">
          Informações do Sistema
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Informação do PostgreSQL */}
          <div className="p-4 bg-gray-850 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-teal-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7"
                />
              </svg>
              <h3 className="text-md font-medium text-gray-200">PostgreSQL</h3>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-2 h-2 rounded-full bg-teal-500 mr-2"></div>
                <span>Conectado</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Versão: PostgreSQL 15.0
              </p>
            </div>
          </div>

          {/* Informação do Diretório de Backup */}
          <div className="p-4 bg-gray-850 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-teal-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <h3 className="text-md font-medium text-gray-200">
                Diretório de Backup
              </h3>
            </div>
            <div className="mt-2 bg-gray-900 p-2 rounded border border-gray-700">
              <p className="text-sm text-gray-400 font-mono break-words">
                /backups
              </p>
            </div>
          </div>

          {/* Informação da Data Atual */}
          <div className="p-4 bg-gray-850 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-teal-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-md font-medium text-gray-200">Data Atual</h3>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-300">{dataAtual}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de chamada para ação */}
      <div className="bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 rounded-lg shadow-md p-6 text-white border border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold mb-2">
              Gerencie seus bancos de dados com facilidade
            </h2>
            <p className="text-gray-300">
              Acesse todas as funcionalidades para gerenciar seus bancos
              PostgreSQL.
            </p>
          </div>
          <Link
            href="/dashboard/databases"
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-md shadow transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Ir para Bancos de Dados
          </Link>
        </div>
      </div>
    </div>
  );
}

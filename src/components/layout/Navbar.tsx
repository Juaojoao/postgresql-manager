"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 fixed z-30 w-full shadow-lg">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    mobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>

            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <div className="flex items-center">
                  <div className="bg-teal-500 p-1.5 rounded">
                    <svg
                      className="h-6 w-6 text-gray-900"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  </div>
                  <span className="ml-2 text-xl font-bold text-white">
                    PostgreSQL Manager
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-700 px-3 py-1 rounded-md">
              <div className="h-2 w-2 rounded-full bg-teal-400 mr-2 animate-pulse"></div>
              <span className="text-sm text-gray-200">PostgreSQL Online</span>
            </div>

            <div className="hidden md:flex items-center py-1 px-3 bg-gray-700 rounded-md">
              <svg
                className="w-4 h-4 text-teal-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm text-gray-200">
                {session?.user?.email || "Usuário"}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded-md text-gray-100 text-sm transition-colors border border-gray-600 flex items-center shadow-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-700 shadow-lg">
          <Link
            href="/dashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/dashboard")
                ? "bg-teal-600 text-white"
                : "text-gray-200 hover:bg-gray-600"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/databases"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/dashboard/databases")
                ? "bg-teal-600 text-white"
                : "text-gray-200 hover:bg-gray-600"
            }`}
          >
            Bancos de Dados
          </Link>
          <Link
            href="/dashboard/logs"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/dashboard/logs")
                ? "bg-teal-600 text-white"
                : "text-gray-200 hover:bg-gray-600"
            }`}
          >
            Logs
          </Link>
        </div>
      </div>
    </nav>
  );
}

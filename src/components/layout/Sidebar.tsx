"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          ></path>
        </svg>
      ),
    },
    {
      name: "Bancos de Dados",
      href: "/dashboard/databases",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          ></path>
        </svg>
      ),
    },
    {
      name: "Logs",
      href: "/dashboard/logs",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`bg-gradient-to-b from-gray-800 to-gray-900 text-gray-100 fixed z-20 h-full pt-16 shadow-lg transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      } hidden md:block`}
    >
      <div className="absolute top-20 -right-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="bg-teal-600 text-white p-1 rounded-full shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                collapsed
                  ? "M13 5l7 7-7 7M5 5l7 7-7 7"
                  : "M11 19l-7-7 7-7m8 14l-7-7 7-7"
              }
            />
          </svg>
        </button>
      </div>

      <div className="p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center p-3 rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-teal-600 text-white shadow-md"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <div className={`${collapsed ? "mx-auto" : ""}`}>
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="ml-3 transition-opacity duration-200">
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute bottom-0 w-full p-4">
        <div className="bg-gray-950 p-3 rounded-md shadow-inner border border-gray-800">
          {!collapsed && (
            <div className="text-xs text-gray-400 font-medium mb-1">
              Status do PostgreSQL
            </div>
          )}
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse mr-2"></div>
            {!collapsed && (
              <span className="text-sm text-gray-300">Online</span>
            )}
          </div>
          {!collapsed && (
            <div className="mt-2 text-xs text-gray-400 pt-2 border-t border-gray-800">
              <p className="text-center">PostgreSQL 15.0</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

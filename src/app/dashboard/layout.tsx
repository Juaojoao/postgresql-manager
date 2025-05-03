"use client";

import { SessionProvider } from "next-auth/react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ToastProvider from "@/components/layout/ToastProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-900 text-gray-100">
            <Navbar />
            <Sidebar />
            <main className="ml-0 md:ml-64 pt-16 min-h-screen transition-all duration-300 ease-in-out">
              <div className="p-4 md:p-6 lg:p-8">{children}</div>
            </main>
          </div>
        </ProtectedRoute>
      </ToastProvider>
    </SessionProvider>
  );
}

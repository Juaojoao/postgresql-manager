"use client";

import React, { createContext, useContext } from "react";
import { toast, ToastOptions } from "react-toastify";

// Define os tipos para o contexto
type NotificationType = "success" | "error" | "info" | "warning";
type ToastFunction = (message: string, options?: ToastOptions) => void;

interface NotificationContextType {
  showNotification: (
    type: NotificationType,
    message: string,
    options?: ToastOptions
  ) => void;
  success: ToastFunction;
  error: ToastFunction;
  info: ToastFunction;
  warning: ToastFunction;
}

// Cria o contexto com valores padrão
const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
});

// Hook personalizado para facilitar o uso do contexto
export const useNotification = () => useContext(NotificationContext);

// Provedor do contexto
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Função principal para mostrar notificações
  const showNotification = (
    type: NotificationType,
    message: string,
    options?: ToastOptions
  ) => {
    toast[type](message, options);
  };

  // Funções de conveniência para cada tipo de notificação
  const success = (message: string, options?: ToastOptions) => {
    showNotification("success", message, options);
  };

  const error = (message: string, options?: ToastOptions) => {
    showNotification("error", message, options);
  };

  const info = (message: string, options?: ToastOptions) => {
    showNotification("info", message, options);
  };

  const warning = (message: string, options?: ToastOptions) => {
    showNotification("warning", message, options);
  };

  // Valor do contexto
  const contextValue: NotificationContextType = {
    showNotification,
    success,
    error,
    info,
    warning,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

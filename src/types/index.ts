// Este arquivo define tipos e interfaces utilizados no projeto.

export interface Database {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Backup {
  id: string;
  databaseId: string;
  backupFilePath: string;
  createdAt: Date;
}

export interface Log {
  id: string;
  action: string;
  timestamp: Date;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para o sistema de bancos de dados

export type DatabaseType = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BackupType = {
  id: number;
  filename: string;
  size: number;
  createdAt: Date;
  databaseId: number;
  database?: DatabaseType;
};

export type LogType = {
  id: number;
  action: "CREATE" | "BACKUP" | "RESTORE" | "DELETE";
  message: string;
  createdAt: Date;
  databaseId: number;
  userId?: number;
  database?: DatabaseType;
};

export type UserType = {
  id: number;
  name?: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

// Tipos para respostas API

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export type DatabaseListResponse = {
  databases: string[];
};

export type BackupListResponse = {
  backups: {
    filename: string;
    size: number;
    createdAt: string;
  }[];
};

export type LogsResponse = {
  logs: LogType[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};

// Tipos para estados de componentes

export type FilterState = {
  action: string | null;
  databaseId: string | null;
};

export type PaginationState = {
  total: number;
  limit: number;
  offset: number;
};

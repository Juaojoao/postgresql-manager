// lib/prisma.ts
import { PrismaClient } from "@/generated/prisma";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuração explícita do caminho do engine
const prismaClientOptions = {
  // Importante! Isso diz ao Prisma onde encontrar o engine
  __internal: {
    engine: {
      binaryPath: path.join(
        process.cwd(),
        "src/generated/prisma/query_engine-windows.dll.node"
      ),
    },
  },
};

// @ts-ignore - O parâmetro __internal não está tipado no PrismaClient
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

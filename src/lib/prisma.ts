// lib/prisma.ts
import { PrismaClient } from "@/generated/prisma";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Usamos uma solução padrão sem configurações internas complexas
// Isso resolve o problema de tipagem e permite que o Prisma funcione normalmente
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

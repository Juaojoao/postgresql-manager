import { NextRequest, NextResponse } from "next/server";
import { listDatabases } from "@/services/postgres";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Declarar a variável session no escopo global da função
  const session = await getServerSession(authOptions);

  try {
    if (!session) {
      return NextResponse.json(
        {
          error: "Não autorizado",
          toast: {
            type: "error",
            message: "Acesso negado. Por favor, faça login novamente.",
          },
        },
        { status: 401 }
      );
    }

    const databases = await listDatabases();

    return NextResponse.json({
      databases,
    });
  } catch (error: any) {
    console.error("Erro ao listar bancos de dados:", error);

    // Tentativa de registrar o erro no sistema de logs
    try {
      const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

      await prisma.log.create({
        data: {
          action: "ERROR",
          message: `Erro ao listar bancos de dados: ${error.message}`,
          description: `Ocorreu um erro ao tentar listar os bancos de dados: ${error.message}`,
          userId: userId,
        },
      });
    } catch (logError) {
      console.error("Não foi possível registrar o erro no log:", logError);
    }

    return NextResponse.json(
      {
        error: `Erro ao listar bancos de dados: ${error.message}`,
        toast: {
          type: "error",
          message: `Falha ao listar bancos de dados: ${error.message}`,
        },
      },
      { status: 500 }
    );
  }
}

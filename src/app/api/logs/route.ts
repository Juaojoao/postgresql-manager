import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const databaseId = searchParams.get("databaseId");
    const action = searchParams.get("action");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Construir filtro
    const where: any = {};
    if (databaseId) {
      where.databaseId = parseInt(databaseId);
    }
    if (action) {
      where.action = action;
    }

    try {
      // Buscar logs
      const logs = await prisma.log.findMany({
        where,
        include: {
          database: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      // Contar total de logs com os mesmos filtros
      const totalLogs = await prisma.log.count({
        where,
      });
      return NextResponse.json({
        logs,
        pagination: {
          total: totalLogs,
          limit,
          offset,
        },
      });
    } catch (dbError: any) {
      console.error("Erro de banco de dados ao buscar logs:", dbError);
      return NextResponse.json(
        { error: `Erro de banco de dados: ${dbError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Erro ao processar requisição de logs:", error);
    return NextResponse.json(
      { error: `Erro ao buscar logs: ${error.message}` },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createDatabase } from "@/services/postgres";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  // Verificar autenticação - movido para fora do bloco try para ser acessível em todo o escopo
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Analisar a requisição
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "O nome do banco de dados é obrigatório" },
        { status: 400 }
      );
    }

    // Validar nome do banco de dados (apenas letras, números e underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return NextResponse.json(
        {
          error:
            "Nome do banco de dados inválido. Use apenas letras, números e underscores.",
        },
        { status: 400 }
      );
    }

    // Criar o banco de dados
    const result = await createDatabase(name);

    // Registrar no banco de dados de gerenciamento
    const database = await prisma.database.create({
      data: {
        name,
      },
    });

    // Converter userId para número antes de passar ao Prisma
    const userId = session.user?.id ? parseInt(session.user.id) : null;

    // Registrar log da operação
    await prisma.log.create({
      data: {
        action: "CREATE",
        message: `Banco de dados '${name}' criado`,
        description: `Banco de dados '${name}' foi criado com sucesso por ${
          session.user?.email || "usuário desconhecido"
        }.`,
        databaseId: database.id,
        userId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      database,
    });
  } catch (error: any) {
    console.error("Erro ao criar banco de dados:", error);

    // Tentativa de registrar o erro no sistema de logs
    try {
      // Converter userId para número antes de passar ao Prisma
      const userId = session.user?.id ? parseInt(session.user.id) : null;

      await prisma.log.create({
        data: {
          action: "ERROR",
          message: `Erro ao criar banco de dados: ${error.message}`,
          description: `Ocorreu um erro ao tentar criar o banco de dados: ${error.message}`,
          userId: userId,
        },
      });
    } catch (logError) {
      console.error("Não foi possível registrar o erro no log:", logError);
    }

    return NextResponse.json(
      {
        error: `Erro ao criar banco de dados: ${error.message}`,
        toast: {
          type: "error",
          message: `Falha ao criar banco de dados: ${error.message}`,
        },
      },
      { status: 500 }
    );
  }
}

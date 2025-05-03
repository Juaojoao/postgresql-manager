import { NextRequest, NextResponse } from "next/server";
import { listTables } from "@/services/postgres";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/options";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Declarar a variável session no escopo global da função
  const session = await getServerSession(authOptions);

  try {
    // Verificar autenticação
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

    // Obter parâmetro de consulta db (nome do banco de dados)
    const searchParams = request.nextUrl.searchParams;
    const databaseName = searchParams.get("db");

    if (!databaseName) {
      return NextResponse.json(
        {
          error: "Nome do banco de dados não fornecido",
          toast: {
            type: "error",
            message: "É necessário especificar um banco de dados.",
          },
        },
        { status: 400 }
      );
    }

    // Listar tabelas do banco de dados
    const tables = await listTables(databaseName);

    // Encontrar o banco de dados no sistema
    const database = await prisma.database.findFirst({
      where: {
        name: databaseName,
      },
    });

    // Converter userId para número se existir
    const userId = session.user?.id ? parseInt(session.user.id, 10) : null;

    // Se o banco existe no sistema, registra o log de consulta de tabelas
    if (database) {
      await prisma.log.create({
        data: {
          action: "LIST_TABLES",
          message: `Listagem de tabelas do banco de dados '${databaseName}': ${tables.length} tabela(s) encontrada(s)`,
          description: `Usuário ${
            session.user?.email || "desconhecido"
          } consultou a estrutura do banco de dados '${databaseName}'. Foram encontradas ${
            tables.length
          } tabela(s).`,
          databaseId: database.id,
          userId: userId,
        },
      });
    } else {
      // Se o banco não existe no sistema, criar um registro
      const newDatabase = await prisma.database.create({
        data: {
          name: databaseName,
          createdAt: new Date(),
        },
      });

      // Registrar o log
      await prisma.log.create({
        data: {
          action: "LIST_TABLES",
          message: `Listagem de tabelas do banco de dados '${databaseName}': ${tables.length} tabela(s) encontrada(s) (banco registrado automaticamente)`,
          description: `Usuário ${
            session.user?.email || "desconhecido"
          } consultou a estrutura do banco de dados '${databaseName}'. O banco foi registrado automaticamente no sistema. Foram encontradas ${
            tables.length
          } tabela(s).`,
          databaseId: newDatabase.id,
          userId: userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      tables,
      toast: {
        type: "info",
        message: `Encontradas ${tables.length} tabela(s) no banco '${databaseName}'.`,
      },
    });
  } catch (error: any) {
    console.error("Erro ao listar tabelas:", error);

    // Tentativa de registrar o erro no sistema de logs mesmo em caso de falha
    try {
      const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

      await prisma.log.create({
        data: {
          action: "ERROR",
          message: `Erro ao listar tabelas: ${error.message}`,
          description: `Ocorreu um erro ao tentar listar as tabelas do banco de dados: ${error.message}`,
          userId: userId,
        },
      });
    } catch (logError) {
      console.error("Não foi possível registrar o erro no log:", logError);
    }

    return NextResponse.json(
      {
        error: "Erro ao listar tabelas",
        message: error.message,
        toast: {
          type: "error",
          message: `Falha ao listar tabelas: ${error.message}`,
        },
      },
      { status: 500 }
    );
  }
}

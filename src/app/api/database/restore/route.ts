import { NextRequest, NextResponse } from "next/server";
import { restoreDatabase } from "@/services/postgres";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  // Declarar a variável session no escopo global da função
  const session = await getServerSession(authOptions);
  // Declarar a variável para armazenar o nome do banco de dados
  let databaseName = "";
  let backupFileName = "";

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

    // Analisar a requisição
    const requestData = await request.json();
    databaseName = requestData.databaseName;
    backupFileName = requestData.backupFileName;

    if (!databaseName || !backupFileName) {
      return NextResponse.json(
        {
          error:
            "O nome do banco de dados e o arquivo de backup são obrigatórios",
          toast: {
            type: "error",
            message:
              "Você precisa informar o banco de dados e o arquivo de backup.",
          },
        },
        { status: 400 }
      );
    }

    // Converter userId para número se existir
    const userId = session.user?.id ? parseInt(session.user.id, 10) : null;

    // Restaurar o banco de dados a partir do backup
    const result = await restoreDatabase(databaseName, backupFileName);

    // Verificar se o banco de dados existe no nosso sistema
    let database = await prisma.database.findFirst({
      where: {
        name: databaseName,
      },
    });

    // Se o banco de dados não existe no nosso sistema, criar um registro para ele
    if (!database) {
      database = await prisma.database.create({
        data: {
          name: databaseName,
          createdAt: new Date(),
        },
      });
    }

    // Registrar log da operação
    await prisma.log.create({
      data: {
        action: "RESTORE",
        message: `Banco de dados '${databaseName}' restaurado a partir do backup '${backupFileName}'`,
        description: `Restauração do backup ${backupFileName} para o banco de dados ${databaseName} realizada com sucesso.`,
        databaseId: database.id,
        userId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      toast: {
        type: "success",
        message: `Banco de dados '${databaseName}' restaurado com sucesso!`,
      },
    });
  } catch (error: any) {
    console.error("Erro ao restaurar banco de dados:", error);

    // Tentativa de registrar o erro no sistema de logs
    try {
      const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

      // Buscar ou criar um registro para o banco de dados
      let database = null;
      if (databaseName) {
        database = await prisma.database.findFirst({
          where: {
            name: databaseName,
          },
        });

        if (!database) {
          database = await prisma.database.create({
            data: {
              name: databaseName,
              createdAt: new Date(),
            },
          });
        }
      }

      if (database) {
        await prisma.log.create({
          data: {
            action: "ERROR",
            message: `Erro ao restaurar banco de dados: ${error.message}`,
            description: `Falha na tentativa de restauração: ${error.message}`,
            userId: userId,
            databaseId: database.id,
          },
        });
      } else {
        console.error(
          "Não foi possível registrar o erro no log: database não identificado"
        );
      }
    } catch (logError) {
      console.error("Não foi possível registrar o erro no log:", logError);
    }

    return NextResponse.json(
      {
        error: `Erro ao restaurar banco de dados: ${error.message}`,
        toast: {
          type: "error",
          message: `Falha na restauração: ${error.message}`,
        },
      },
      { status: 500 }
    );
  }
}

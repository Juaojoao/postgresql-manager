import { NextRequest, NextResponse } from "next/server";
import { backupDatabase } from "@/services/postgres";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/options";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  // Declarar a variável session no escopo global da função
  const session = await getServerSession(authOptions);

  try {
    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Analisar a requisição
    const { databaseName } = await request.json();

    if (!databaseName) {
      return NextResponse.json(
        { error: "O nome do banco de dados é obrigatório" },
        { status: 400 }
      );
    }

    // Converter userId para número se existir
    const userId = session.user?.id ? parseInt(session.user.id, 10) : null;

    // Fazer backup do banco de dados
    const result = await backupDatabase(databaseName);

    // Encontrar o banco de dados no sistema
    const database = await prisma.database.findFirst({
      where: {
        name: databaseName,
      },
    });

    let backupRecord = null;

    if (database) {
      // Registrar o backup no sistema
      backupRecord = await prisma.backup.create({
        data: {
          filename: result.filename,
          size: result.size,
          databaseId: database.id,
        },
      });

      // Registrar log da operação
      await prisma.log.create({
        data: {
          action: "BACKUP",
          message: `Backup do banco de dados '${databaseName}' criado: ${result.filename}`,
          description: `Backup do banco de dados '${databaseName}' foi criado com sucesso. Arquivo: ${result.filename}, Tamanho: ${result.size} bytes.`,
          databaseId: database.id,
          userId: userId,
        },
      });
    } else {
      // Se o banco não está registrado, criar um registro para ele primeiro
      const newDatabase = await prisma.database.create({
        data: {
          name: databaseName,
          createdAt: new Date(),
        },
      });

      // Registrar o backup associado ao novo registro de banco
      backupRecord = await prisma.backup.create({
        data: {
          filename: result.filename,
          size: result.size,
          databaseId: newDatabase.id,
        },
      });

      // Registrar log da operação
      await prisma.log.create({
        data: {
          action: "BACKUP",
          message: `Backup do banco de dados '${databaseName}' criado: ${result.filename} (banco registrado automaticamente)`,
          description: `Backup do banco de dados '${databaseName}' foi criado com sucesso. O banco de dados foi registrado automaticamente no sistema. Arquivo: ${result.filename}, Tamanho: ${result.size} bytes.`,
          databaseId: newDatabase.id,
          userId: userId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      backup: backupRecord,
      toast: {
        type: "success",
        message: `Backup do banco '${databaseName}' realizado com sucesso!`,
      },
    });
  } catch (error: any) {
    console.error("Erro ao fazer backup do banco de dados:", error);

    // Tentativa de registrar o erro no sistema de logs mesmo em caso de falha
    try {
      const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

      await prisma.log.create({
        data: {
          action: "ERROR",
          message: `Erro ao fazer backup: ${error.message}`,
          description: `Ocorreu um erro ao tentar fazer backup do banco de dados: ${error.message}`,
          userId: userId,
        },
      });
    } catch (logError) {
      console.error("Não foi possível registrar o erro no log:", logError);
    }

    return NextResponse.json(
      {
        error: `Erro ao fazer backup do banco de dados: ${error.message}`,
        toast: {
          type: "error",
          message: `Falha ao realizar backup: ${error.message}`,
        },
      },
      { status: 500 }
    );
  }
}

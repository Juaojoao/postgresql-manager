import { NextRequest, NextResponse } from "next/server";
import { deleteDatabase } from "@/services/postgres";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  // Declarar a variável session no escopo global da função
  const session = await getServerSession(authOptions);

  try {
    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter nome do banco de dados da URL
    const { searchParams } = new URL(request.url);
    const databaseName = searchParams.get("name");

    if (!databaseName) {
      return NextResponse.json(
        { error: "Nome do banco de dados é obrigatório" },
        { status: 400 }
      );
    }

    // Excluir o banco de dados
    const result = await deleteDatabase(databaseName);

    // Encontrar o banco de dados no sistema
    const database = await prisma.database.findFirst({
      where: {
        name: databaseName,
      },
    });

    if (database) {
      // Converter userId para número se existir
      const userId = session.user?.id ? parseInt(session.user.id, 10) : null;

      // Armazenar o ID do banco de dados para referência
      const databaseId = database.id;

      // Excluir o registro do banco de dados
      await prisma.database.delete({
        where: {
          id: databaseId,
        },
      });

      // Registrar log da operação DEPOIS de excluir o banco de dados
      // e SEM associar ao banco de dados (já que ele não existe mais)
      await prisma.log.create({
        data: {
          action: "DELETE",
          message: `Banco de dados '${databaseName}' excluído`,
          description: `Banco de dados '${databaseName}' (ID: ${databaseId}) foi excluído permanentemente por ${
            session.user?.email || "usuário desconhecido"
          }.`,
          userId: userId,
          // Não fornecemos o databaseId, para que o log não seja associado ao banco excluído
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      toast: {
        type: "success",
        message: `Banco de dados '${databaseName}' excluído com sucesso!`,
      },
    });
  } catch (error: any) {
    console.error("Erro ao excluir banco de dados:", error);

    // Tentativa de registrar o erro no sistema de logs
    try {
      // Converter userId para número se existir
      const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

      await prisma.log.create({
        data: {
          action: "ERROR",
          message: `Erro ao excluir banco de dados: ${error.message}`,
          description: `Ocorreu um erro ao tentar excluir o banco de dados: ${error.message}`,
          userId: userId,
        },
      });
    } catch (logError) {
      console.error("Não foi possível registrar o erro no log:", logError);
    }

    return NextResponse.json(
      {
        error: `Erro ao excluir banco de dados: ${error.message}`,
        toast: {
          type: "error",
          message: `Falha ao excluir banco de dados: ${error.message}`,
        },
      },
      { status: 500 }
    );
  }
}

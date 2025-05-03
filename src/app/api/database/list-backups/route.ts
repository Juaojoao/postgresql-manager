import { NextRequest, NextResponse } from "next/server";
import { listBackups } from "@/services/postgres";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Listar arquivos de backup disponíveis
    const backups = await listBackups();
    return NextResponse.json({ backups });
  } catch (error: any) {
    console.error("Erro ao listar arquivos de backup:", error);
    return NextResponse.json(
      { error: `Erro ao listar arquivos de backup: ${error.message}` },
      { status: 500 }
    );
  }
}

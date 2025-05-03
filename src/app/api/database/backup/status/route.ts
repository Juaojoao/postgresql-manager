import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/options";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Obter ID do backup
    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get("id");

    if (!backupId) {
      return NextResponse.json(
        { error: "ID do backup é obrigatório" },
        { status: 400 }
      );
    }

    // Buscar o backup pelo ID
    const backup = await prisma.backup.findUnique({
      where: { id: Number(backupId) },
    });

    if (!backup) {
      return NextResponse.json(
        { error: "Backup não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o arquivo de backup existe e verificar seu tamanho
    const backupDir = process.env.BACKUP_DIR || "./backups";
    const backupFilePath = path.join(backupDir, backup.filename);

    try {
      // Verificar se o arquivo existe
      const stats = await fs.stat(backupFilePath);

      // Verificar o tamanho do arquivo
      const currentSize = stats.size;

      // Se o tamanho do arquivo ainda for o mesmo do registrado e for diferente de zero,
      // provavelmente o backup foi concluído
      const completed = currentSize > 0 && currentSize === backup.size;

      // Estimar o progresso com base no tamanho esperado (estimativa simples)
      // Usamos 1MB como tamanho mínimo esperado por enquanto
      const expectedMinSize = 1024 * 1024; // 1MB
      const progress = Math.min(
        Math.round(
          (currentSize / Math.max(backup.size, expectedMinSize)) * 100
        ),
        99
      );

      return NextResponse.json({
        completed,
        progress: completed ? 100 : progress,
        size: currentSize,
        filename: backup.filename,
      });
    } catch (error) {
      console.error("Erro ao verificar arquivo de backup:", error);
      return NextResponse.json({
        completed: false,
        progress: 0,
        error: "Não foi possível verificar o arquivo de backup",
      });
    }
  } catch (error: any) {
    console.error("Erro ao verificar status do backup:", error);
    return NextResponse.json(
      { error: `Erro ao verificar status do backup: ${error.message}` },
      { status: 500 }
    );
  }
}

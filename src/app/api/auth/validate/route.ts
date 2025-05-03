import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma"; // Importar o Prisma Client

export async function POST(req: NextRequest) {
  try {
    // Extrair dados do corpo da requisição

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    // Verificar senha com bcrypt
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Sucesso - Retornar dados do usuário (sem a senha)
    return NextResponse.json({
      success: true,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("API de validação - Erro durante autenticação:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

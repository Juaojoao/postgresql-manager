import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("Criando usuário administrador...");

    // Gerar hash para a senha
    const passwordHash = await hash("admin123", 10);

    // Criar usuário admin
    const admin = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "Administrador",
        email: "admin@example.com",
        passwordHash,
      },
    });

    console.log(`Usuário admin criado com sucesso: ${admin.email}`);
    console.log("Email: admin@example.com");
    console.log("Senha: admin123");
    console.log("Lembre-se de alterar essa senha após o primeiro login!");
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

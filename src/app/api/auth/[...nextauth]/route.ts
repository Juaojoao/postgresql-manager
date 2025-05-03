import NextAuth, { AuthOptions, SessionStrategy, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma"; // Importar o Prisma Client

// Interface para o resultado da autenticação
interface AuthResult {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// Criar uma API de autenticação interna para resolver o problema do CredentialsSignin
const authenticateUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return { success: false, message: "Usuário não encontrado" };
    }

    // Verificar senha com bcrypt
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return { success: false, message: "Senha incorreta" };
    }

    return {
      success: true,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Erro durante autenticação:", error);
    return { success: false, message: "Erro interno de autenticação" };
  }
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Chamando diretamente a função de autenticação em vez de usar HTTP request
          const authResult = await authenticateUser(
            credentials.email,
            credentials.password
          );

          if (!authResult.success || !authResult.user) {
            return null;
          }

          // Conformar o retorno ao tipo User do NextAuth
          const user: User = {
            id: authResult.user.id,
            name: authResult.user.name,
            email: authResult.user.email,
          };

          return user;
        } catch (error) {
          console.error("Erro durante o processo de autenticação:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

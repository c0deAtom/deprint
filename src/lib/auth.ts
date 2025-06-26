import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/signin", // Error code passed in query string as ?error=
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session(params: any) {
      const { session, token } = params;
      session.user = {
        id: token.sub || "",
        name: session.user?.name ?? undefined,
        email: session.user?.email ?? undefined,
        image: session.user?.image ?? undefined,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 
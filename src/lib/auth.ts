import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const providers: any[] = [
  GitHub({
    authorization: {
      params: { scope: "read:user user:email repo" },
    },
  }),
  Google,
];

if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(Email({ server: process.env.EMAIL_SERVER, from: process.env.EMAIL_FROM }));
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

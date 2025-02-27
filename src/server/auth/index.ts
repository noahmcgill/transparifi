import NextAuth from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "../db";
import Resend from "next-auth/providers/resend";

const combinedProviders = [
  ...authConfig.providers,
  Resend({
    apiKey: process.env.AUTH_RESEND_KEY,
    from: process.env.AUTH_RESEND_FROM,
  }),
];

const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  providers: combinedProviders,
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };

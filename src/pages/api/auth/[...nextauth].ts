import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        // Include the user ID in the token
        token.id = user.id || (user as any).sub || token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      // Add the user ID to the session
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If the url is relative, prefix it with the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If the url is on the same origin, allow it
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
};

export default NextAuth(authOptions); 
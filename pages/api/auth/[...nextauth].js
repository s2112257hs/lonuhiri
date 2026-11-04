import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createUserAuth } from "@/lib/userAuth";

const userAuth = createUserAuth({ User, connect: connectToDatabase });
export const authOptions = {
  providers: [CredentialsProvider({
    name: "Credentials",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    authorize: userAuth.authorize,
  })],
  callbacks: { jwt: userAuth.jwt, session: userAuth.session },
  pages: { signIn: "/auth/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
export default NextAuth(authOptions);

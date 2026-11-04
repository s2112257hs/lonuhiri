export function createUserAuth({ User, connect }) {
  return {
    async authorize(credentials) {
      if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") return null;
      const email = credentials.email.trim().toLowerCase();
      if (!email || !credentials.password || Buffer.byteLength(credentials.password, "utf8") > 72) return null;
      await connect();
      const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const user = await User.findOne({ email: { $regex: `^${escaped}$`, $options: "i" } }).select("+password");
      if (!user || !await user.comparePassword(credentials.password)) return null;
      return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, sessionVersion: user.sessionVersion || 0 };
    },
    async jwt({ token, user }) {
      if (user) return { ...token, id: user.id, role: user.role, sessionVersion: user.sessionVersion };
      if (!token?.id) return { invalid: true };
      await connect();
      const current = await User.findById(token.id).select("name email role sessionVersion");
      if (!current || (token.sessionVersion || 0) !== (current.sessionVersion || 0)) return { invalid: true };
      return { ...token, name: current.name, email: current.email, role: current.role };
    },
    async session({ session, token }) {
      if (token.invalid || !token.id) return null;
      session.user = { ...session.user, id: token.id, name: token.name, email: token.email, role: token.role };
      return session;
    },
  };
}

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, roles } from "@/lib/db/schema/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // IMPORTANTE: 'user.id' ya es un STRING y coincide con el ID de la base de datos
      if (session.user && user.id) {
        session.user.id = user.id;

        // Hacemos el JOIN directamente con el ID de texto
        const result = await db
          .select({
            weight: roles.weight,
            roleName: roles.name,
          })
          .from(users)
          .innerJoin(roles, eq(users.roleId, roles.id))
          .where(eq(users.id, user.id)) // Usamos 'user.id' directamente
          .limit(1);

        if (result.length > 0) {
          session.user.roleWeight = parseFloat(result[0].weight);
          session.user.roleName = result[0].roleName;
        } else {
          // Fallback por si el usuario es nuevo y no tiene rol asignado aún
          session.user.roleWeight = 0.5;
          session.user.roleName = "Comunidad";
        }
      }
      return session;
    },
  },
});

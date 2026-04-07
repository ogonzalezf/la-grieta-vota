import { auth } from "@/auth";

export async function isUserAdmin() {
  const session = await auth();
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
  return !!session?.user?.email && adminEmails.includes(session.user.email);
}

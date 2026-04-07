import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userEmail = req.auth?.user?.email;

  // Lista blanca de admins (asegúrate que tu .env esté cargado)
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");

  const isAdminPath = nextUrl.pathname.startsWith("/admin");

  // Si intenta entrar a admin y no es admin, redirigir a la home
  if (isAdminPath) {
    if (!isLoggedIn || !userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Ajustamos el matcher para que NO intercepte peticiones internas de Auth.js
  // Esto evita el error de "Unexpected token <"
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

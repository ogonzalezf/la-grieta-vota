import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import Providers from "@/components/Providers";
import Sidebar from "@/components/Sidebar";
import AuthStatus from "@/components/AuthStatus";
import GlobalSearch from "@/components/GlobalSearch";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Grieta Vota | Análisis de Desempeño LoL",
  description:
    "Plataforma de votación ponderada para la comunidad de League of Legends",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Lógica de Administradores
  const adminEmailsString = process.env.ADMIN_EMAILS || "";
  const activeTournament = process.env.TOURNAMENT_ACTIVE || "LEC SPRING 2026";
  const adminEmailsArray = adminEmailsString
    .split(",")
    .map((email) => email.trim());
  const userEmail = session?.user?.email;
  const isAdmin = !!userEmail && adminEmailsArray.includes(userEmail);

  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#0b1120] text-white antialiased`}
      >
        <Providers>
          <div className="flex h-screen w-full overflow-hidden bg-[#0b1120]">
            {/* SIDEBAR: Contiene el logo y navegación principal */}
            <Sidebar isAdmin={isAdmin} activeTournament={activeTournament} />

            {/* CONTENEDOR DE CONTENIDO */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">
              <header className="h-20 flex items-center justify-between px-4 lg:px-8 border-b border-slate-800/60 bg-[#0b1120]/95 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-6 flex-1">
                  {/* Espacio reservado para el buscador global */}
                  <div className="hidden md:block w-full max-w-sm">
                    <GlobalSearch />
                  </div>
                </div>

                {/* Perfil de usuario y Login */}
                <AuthStatus session={session} />
              </header>

              {/* ÁREA DE CONTENIDO DINÁMICO */}
              <main className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Ajustamos el padding para tablets */}
                <div className="max-w-[1600px] mx-auto p-4 md:p-6 xl:p-10">
                  {children}
                  <Analytics />
                </div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

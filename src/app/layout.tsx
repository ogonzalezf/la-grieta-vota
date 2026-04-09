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
  // 1. Obtenemos la sesión en el servidor
  const session = await auth();

  // 2. Calculamos si el usuario es Admin desde el servidor
  const adminEmailsString = process.env.ADMIN_EMAILS || "";
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
          {/* Contenedor principal: Ocupa toda la pantalla y evita scroll lateral */}
          <div className="flex h-screen w-full overflow-hidden bg-[#0b1120]">
            {/* SIDEBAR: Recibe la prop 'isAdmin'. 
                Al estar fuera del flujo de scroll de 'main', se mantiene fijo.
            */}
            <Sidebar isAdmin={isAdmin} />

            {/* CONTENEDOR DE CONTENIDO (Header + Main) */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#0b1120]">
              {/* HEADER: Fondo sólido para evitar transparencias raras */}
              <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-slate-800/60 bg-[#0b1120] sticky top-0 z-40">
                <div className="flex items-center gap-6 flex-1">
                  {" "}
                  {/* Añadido flex-1 y gap */}
                  {/* Logo para móvil */}
                  <div className="lg:hidden">
                    <h1 className="font-black text-xl tracking-tighter italic">
                      GRIETA<span className="text-lol-cyan">VOTA</span>
                    </h1>
                  </div>
                  {/* BUSCADOR GLOBAL: Lo insertamos aquí para que esté a la izquierda/centro */}
                  <div className="hidden md:block w-full max-w-sm">
                    <GlobalSearch />
                  </div>
                </div>

                {/* Perfil de usuario y Login */}
                <AuthStatus session={session} />
              </header>

              {/* ÁREA DE CONTENIDO DINÁMICO */}
              <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0b1120]">
                <div className="w-full h-full p-4 md:p-8 lg:p-10">
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

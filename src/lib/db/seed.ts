import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/schema";

// import path from "path";

// 1. FORZAR LA CARGA DEL ARCHIVO .env.local
// Buscamos el archivo en la raíz del proyecto
// dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL no encontrada en .env");
  console.log(
    "Asegúrate de que el archivo .env.local existe en la raíz y tiene la variable.",
  );
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function main() {
  console.log("⏳ Iniciando siembra de datos (Seed)...");

  try {
    // 2. INSERTAR ROLES
    console.log("--- Insertando Roles ---");
    await db
      .insert(schema.roles)
      .values([
        { id: 1, name: "Especialista", weight: "4.00" },
        { id: 2, name: "Jugador Pro", weight: "3.50" },
        { id: 3, name: "Entrenador", weight: "3.50" },
        { id: 4, name: "Caster", weight: "2.00" },
        { id: 5, name: "Usuario", weight: "0.50" },
      ])
      .onConflictDoNothing();

    // 3. INSERTAR EQUIPOS DE EJEMPLO (Opcional, para pruebas)
    console.log("--- Insertando Equipos de ejemplo ---");
    await db
      .insert(schema.teams)
      .values([
        {
          id: 1,
          name: "G2 Esports",
          region: "LEC",
          logoUrl: "https://lolesports.com/teams/g2-esports.png",
        },
        {
          id: 2,
          name: "Fnatic",
          region: "LEC",
          logoUrl: "https://lolesports.com/teams/fnatic.png",
        },
        {
          id: 3,
          name: "T1",
          region: "LCK",
          logoUrl: "https://lolesports.com/teams/t1.png",
        },
      ])
      .onConflictDoNothing();

    console.log("✅ Seed finalizado con éxito.");
  } catch (error) {
    console.error("❌ Error durante el seed:", error);
    process.exit(1);
  }
}

main();

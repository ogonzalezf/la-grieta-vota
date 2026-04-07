import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/schema";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seedTestData() {
  console.log("🚀 Insertando datos reales de la LEC para pruebas...");

  try {
    // 1. Insertar Equipos Actualizados
    // const insertedTeams = await db
    //   .insert(schema.teams)
    //   .values([
    //     {
    //       id: 1,
    //       name: "G2 Esports",
    //       region: "LEC",
    //       logoUrl: "http://static.lolesports.com/teams/G2-FullonDark.png",
    //     }, // Reemplazar con logos reales
    //     {
    //       id: 2,
    //       name: "Fnatic",
    //       region: "LEC",
    //       logoUrl:
    //         "http://static.lolesports.com/teams/1631819669150_fnc-2021-worlds.png",
    //     },
    //     {
    //       id: 3,
    //       name: "Team Heretics",
    //       region: "LEC",
    //       logoUrl:
    //         "http://static.lolesports.com/teams/1672933861879_Heretics-Full-Color.png",
    //     },
    //     {
    //       id: 4,
    //       name: "Karmine Corp",
    //       region: "LEC",
    //       logoUrl: "http://static.lolesports.com/teams/1704714951336_KC.png",
    //     },
    //     {
    //       id: 5,
    //       name: "SK Gaming",
    //       region: "LEC",
    //       logoUrl:
    //         "http://static.lolesports.com/teams/1643979272144_SK_Monochrome.png",
    //     },
    //     {
    //       id: 6,
    //       name: "Natus Vincere",
    //       region: "LEC",
    //       logoUrl:
    //         "http://static.lolesports.com/teams/1752746833620_NAVI_FullColor.png",
    //     },
    //   ])
    //   .onConflictDoNothing();

    // 2. Insertar Partidos (Próximos y "En Vivo" simulado)
    const now = new Date();

    await db
      .insert(schema.matches)
      .values([
        {
          id: 101,
          teamAId: 6, // NAVI
          teamBId: 4, // KC
          tournamentName: "LEC SUMMER 2025",
          status: "FINISHED", // Para probar la visualización de "Votar"
          matchDate: new Date("2025-08-02T17:00:00Z"),
        },
        {
          id: 102,
          teamAId: 3, // Heretics
          teamBId: 2, // Fnatic
          tournamentName: "LEC SUMMER 2025",
          status: "LIVE", // Para probar el indicador animado
          matchDate: new Date(now.getTime() - 3600000), // Empezó hace una hora
        },
        {
          id: 103,
          teamAId: 1, // G2
          teamBId: 3, // Heretics
          tournamentName: "LEC SUMMER 2025",
          status: "UPCOMING", // Para probar el estado desactivado
          matchDate: new Date("2025-08-09T19:15:00Z"),
        },
      ])
      .onConflictDoNothing();

    console.log("✅ Datos de prueba insertados.");
  } catch (e) {
    console.error("❌ Error al insertar datos:", e);
  }
}

seedTestData();

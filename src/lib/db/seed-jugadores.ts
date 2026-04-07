import { db } from "./index";
import { teams, players } from "./schema/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Iniciando Seed LEC 2026 con 10 equipos...");

  const lecData = [
    {
      name: "G2 Esports",
      players: [
        {
          name: "BrokenBlade",
          role: "TOP",
          img: "https://cdn.datalisk.io/players/silhouette.png",
        },
        {
          name: "SkewMond",
          role: "JUNGLE",
          img: "https://cdn.datalisk.io/players/107128052280762804.png",
        },
        {
          name: "Caps",
          role: "MID",
          img: "https://cdn.datalisk.io/players/98767975968177297.png",
        },
        {
          name: "Hans Sama",
          role: "ADC",
          img: "https://cdn.datalisk.io/players/98767975961872793.png",
        },
        {
          name: "Labrov",
          role: "SUPPORT",
          img: "https://cdn.datalisk.io/players/102787200059605684.png",
        },
      ],
    },
    {
      name: "Fnatic",
      players: [
        {
          name: "Empyros",
          role: "TOP",
          img: "https://cdn.datalisk.io/players/109705412728201213.png",
        },
        {
          name: "Razork",
          role: "JUNGLE",
          img: "https://cdn.datalisk.io/players/100238780551262852.png",
        },
        {
          name: "Vladi",
          role: "MID",
          img: "https://cdn.datalisk.io/players/107045034481599547.png",
        },
        {
          name: "Upset",
          role: "ADC",
          img: "https://cdn.datalisk.io/players/99322214653265200.png",
        },
        {
          name: "Lospa",
          role: "SUPPORT",
          img: "https://cdn.datalisk.io/players/107492067202132417.png",
        },
      ],
    },
    {
      name: "Team Heretics",
      players: [
        {
          name: "Tracyn",
          role: "TOP",
          img: "https://cdn.datalisk.io/players/107156544177574787.png",
        },
        {
          name: "Sheo",
          role: "JUNGLE",
          img: "https://cdn.datalisk.io/players/105830645287286396.png",
        },
        {
          name: "Serin",
          role: "MID",
          img: "https://cdn.datalisk.io/players/102174699705191142.png",
        },
        {
          name: "Ice",
          role: "ADC",
          img: "https://cdn.datalisk.io/players/105501834624360050.png",
        },
        {
          name: "Way",
          role: "SUPPORT",
          img: "https://cdn.datalisk.io/players/107492119089043087.png",
        },
      ],
    },
    {
      name: "Movistar KOI",
      players: [
        {
          name: "Myrwn",
          role: "TOP",
          img: "https://cdn.datalisk.io/players/110350224593953686.png",
        },
        {
          name: "Elyoya",
          role: "JUNGLE",
          img: "https://cdn.datalisk.io/players/103877629120745120.png",
        },
        {
          name: "Jojopyun",
          role: "MID",
          img: "https://cdn.datalisk.io/players/105504920899018806.png",
        },
        {
          name: "Supa",
          role: "ADC",
          img: "https://cdn.datalisk.io/players/103536968833612789.png",
        },
        {
          name: "Alvaro",
          role: "SUPPORT",
          img: "https://cdn.datalisk.io/players/silhouette.png",
        },
      ],
    },
    {
      name: "Karmine Corp",
      players: [
        {
          name: "Canna",
          role: "TOP",
          img: "https://cdn.datalisk.io/players/103495716771322725.png",
        },
        {
          name: "Yike",
          role: "JUNGLE",
          img: "https://cdn.datalisk.io/players/105537190986692036.png",
        },
        {
          name: "Kyeahoo",
          role: "MID",
          img: "https://cdn.datalisk.io/players/108205130709313212.png",
        },
        {
          name: "Caliste",
          role: "ADC",
          img: "https://cdn.datalisk.io/players/109461265532592848.png",
        },
        {
          name: "Busio",
          role: "SUPPORT",
          img: "https://cdn.datalisk.io/players/106625308523122120.png",
        },
      ],
    },
    {
      name: "Natus Vincere",
      players: [
        {
          name: "Maynter",
          role: "TOP",
          img: "https://cdn.datalisk.io/players/105700869624784693.png",
        },
        {
          name: "Rhilech",
          role: "JUNGLE",
          img: "https://cdn.datalisk.io/players/105548731617719496.png",
        },
        {
          name: "Poby",
          role: "MID",
          img: "https://cdn.datalisk.io/players/107840393299826151.png",
        },
        {
          name: "SamD",
          role: "ADC",
          img: "https://cdn.datalisk.io/players/104287359934240404.png",
        },
        {
          name: "Parus",
          role: "SUPPORT",
          img: "https://cdn.datalisk.io/players/103805069759346933.png",
        },
      ],
    },
    {
      name: "SK Gaming",
      players: [
        {
          name: "Wunder",
          role: "TOP",
          img: "https://cdn.datalisk.io/players/99322214618656216.png",
        },
        {
          name: "Skeanz",
          role: "JUNGLE",
          img: "https://cdn.datalisk.io/players/101389808348806587.png",
        },
        {
          name: "LIDER",
          role: "MID",
          img: "https://cdn.datalisk.io/players/103889902476986558.png",
        },
        {
          name: "Jopa",
          role: "ADC",
          img: "https://cdn.datalisk.io/players/105553696718837337.png",
        },
        {
          name: "Mikyx",
          role: "SUPPORT",
          img: "https://cdn.datalisk.io/players/99322214629661297.png",
        },
      ],
    },
    {
      name: "Giantx",
      players: [
        {
          name: "Lot",
          role: "TOP",
          img: "https://cdn.datalisk.io/players/103495716738607011.png",
        },
        {
          name: "ISMA",
          role: "JUNGLE",
          img: "https://cdn.datalisk.io/players/107464179845128878.png",
        },
        {
          name: "Jackies",
          role: "MID",
          img: "https://cdn.datalisk.io/players/silhouette.png",
        },
        {
          name: "Noah",
          role: "ADC",
          img: "https://cdn.datalisk.io/players/105501717406803640.png",
        },
        {
          name: "Jun",
          role: "SUPPORT",
          img: "https://cdn.datalisk.io/players/silhouette.png",
        },
      ],
    },
    {
      name: "Shifters",
      players: [
        {
          name: "Rooster",
          role: "TOP",
          img: "https://cdn.datalisk.io/players/107767810249714879.png",
        },
        {
          name: "Boukada",
          role: "JUNGLE",
          img: "https://cdn.datalisk.io/players/105515296576479523.png",
        },
        {
          name: "Nuc",
          role: "MID",
          img: "https://cdn.datalisk.io/players/silhouette.png",
        },
        {
          name: "Paduck",
          role: "ADC",
          img: "https://cdn.datalisk.io/players/107492114500277895.png",
        },
        {
          name: "Trymbi",
          role: "SUPPORT",
          img: "https://cdn.datalisk.io/players/102181528883745160.png",
        },
      ],
    },
    {
      name: "Vitality",
      players: [
        {
          name: "Naak Nako",
          role: "TOP",
          img: "https://cdn.datalisk.io/players/107605411481021064.png",
        },
        {
          name: "Lyncas",
          role: "JUNGLE",
          img: "https://cdn.datalisk.io/players/105503548109547493.png",
        },
        {
          name: "Humanoid",
          role: "MID",
          img: "https://cdn.datalisk.io/players/100356590519370319.png",
        },
        {
          name: "Carzzy",
          role: "ADC",
          img: "https://cdn.datalisk.io/players/102787200044335760.png",
        },
        {
          name: "Fleshy",
          role: "SUPPORT",
          img: "https://cdn.datalisk.io/players/107605583684952312.png",
        },
      ],
    },
  ];

  for (const teamInfo of lecData) {
    const teamRecord = await db.query.teams.findFirst({
      where: eq(teams.name, teamInfo.name),
    });

    if (teamRecord) {
      console.log(`Poblando jugadores para ${teamInfo.name}...`);

      const playersToInsert = teamInfo.players.map((p) => ({
        nickname: p.name,
        position: p.role,
        teamId: teamRecord.id,
        imageUrl: p.img,
      }));

      await db.insert(players).values(playersToInsert);
    } else {
      console.warn(
        `⚠️ No se encontró el equipo ${teamInfo.name}. Asegúrate de crearlo primero.`,
      );
    }
  }

  console.log("✅ Seed de la LEC 2026 completado.");
}

main().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});

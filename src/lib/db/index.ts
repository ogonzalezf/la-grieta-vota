import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/schema";

// Verificación de seguridad: si no existe la URL, lanzamos un error claro
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida en las variables de entorno");
}

// CORRECCIÓN: Al haber verificado arriba, TypeScript ahora sabe que
// DATABASE_URL es un string y no dará error en la línea 17.
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

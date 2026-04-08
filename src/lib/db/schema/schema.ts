import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  decimal,
  boolean,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";

// --- 1. TABLAS DE AUTENTICACIÓN (NextAuth) ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // Genera un ID si no viene uno
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  roleId: integer("role_id")
    .default(5)
    .references(() => roles.id),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId") // ANTES: integer
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId") // ANTES: integer
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
// --- 2. TABLAS DE LÓGICA DE NEGOCIO ---

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  weight: decimal("weight", { precision: 3, scale: 2 }).notNull(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  logoUrl: text("logo_url"),
  region: varchar("region", { length: 10 }),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  position: varchar("position", { length: 20 }),
  teamId: integer("team_id").references(() => teams.id, {
    onDelete: "set null",
  }),
  imageUrl: text("logo_url"),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  teamAId: integer("team_a_id").references(() => teams.id),
  teamBId: integer("team_b_id").references(() => teams.id),
  tournamentName: varchar("tournament_name", { length: 100 }),
  status: varchar("status", { length: 20 }).default("UPCOMING"),
  matchDate: timestamp("match_date"),
  createdAt: timestamp("created_at").defaultNow(),
  scoreA: integer("score_a").default(0),
  scoreB: integer("score_b").default(0),
  isVotingActive: boolean("is_voting_active").default(false).notNull(),
});

export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    fingerprint: varchar("fingerprint", { length: 255 }),
    playerId: integer("player_id")
      .references(() => players.id, { onDelete: "cascade" })
      .notNull(),
    matchId: integer("match_id")
      .references(() => matches.id, { onDelete: "cascade" })
      .notNull(),
    score: decimal("score", { precision: 4, scale: 2 }).notNull(),
    appliedWeight: decimal("applied_weight", {
      precision: 3,
      scale: 2,
    }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // Nueva sintaxis para índices y restricciones únicas
    unique("unique_logged_vote").on(
      table.userId,
      table.playerId,
      table.matchId,
    ),
    unique("unique_anon_vote").on(
      table.fingerprint,
      table.playerId,
      table.matchId,
    ),
  ],
);

export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id") // ANTES: integer
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  riotId: varchar("riot_id", { length: 100 }).notNull(), // Ejemplo: Faker#KR1
  requestedRoleId: integer("requested_role_id")
    .references(() => roles.id)
    .notNull(),
  email: text("email").notNull(),
  status: varchar("status", { length: 20 }).default("PENDING"), // PENDING, APPROVED, REJECTED
  evidenceLink: text("evidence_link"), // Opcional: Link a Twitter o Liquipedia
  createdAt: timestamp("created_at").defaultNow(),
});

// --- 3. RELACIONES (Importante para queries con 'with') ---

export const matchesRelations = relations(matches, ({ one }) => ({
  teamA: one(teams, { fields: [matches.teamAId], references: [teams.id] }),
  teamB: one(teams, { fields: [matches.teamBId], references: [teams.id] }),
}));

export const playersRelations = relations(players, ({ one }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  players: many(players),
  matchesA: many(matches, { relationName: "teamA" }),
  matchesB: many(matches, { relationName: "teamB" }),
}));


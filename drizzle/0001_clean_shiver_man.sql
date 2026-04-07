CREATE TABLE "verification_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"riot_id" varchar(100) NOT NULL,
	"requested_role_id" integer NOT NULL,
	"email" text NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING',
	"evidence_link" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "userId" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "votes" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "score_a" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "score_b" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "is_voting_active" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_requested_role_id_roles_id_fk" FOREIGN KEY ("requested_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" DROP COLUMN "is_active";
-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"expires_at" timestamp(6) NOT NULL,
	"token" varchar(255) NOT NULL,
	CONSTRAINT "uk6q9nsb665s9f8qajm3j07kd1e" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"token_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp(6) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"avatar_url" varchar(255),
	"created_at" timestamp(6) NOT NULL,
	"email" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"password" varchar(255),
	"role" varchar(10) NOT NULL,
	"updated_at" timestamp(6) NOT NULL,
	"username" varchar(50) NOT NULL,
	"auth_source" varchar(20) NOT NULL,
	CONSTRAINT "uk6dotkott2kjsp8vw4d0m25fb7" UNIQUE("email"),
	CONSTRAINT "ukr43af9ap4edm43mmtq01oddj6" UNIQUE("username"),
	CONSTRAINT "users_role_check" CHECK ((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'MOD'::character varying, 'USER'::character varying, 'OTHER'::character varying])::text[])),
	CONSTRAINT "users_auth_source_check" CHECK ((auth_source)::text = ANY ((ARRAY['EMAIL'::character varying, 'GOOGLE'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp(6) NOT NULL,
	"preview" text NOT NULL,
	"updated_at" timestamp(6) NOT NULL,
	"user_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"deleted_at" timestamp(6)
);
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "fkechaouoa6kus6k1dpix1u91c" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_user_id" ON "users" USING btree ("id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_user_username" ON "users" USING btree ("username" text_ops);--> statement-breakpoint
CREATE INDEX "idx_note_id" ON "notes" USING btree ("id" uuid_ops);
*/
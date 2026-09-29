import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";
import { PrismaClient } from "@/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Neon suspends its compute when no connection is open, and a plain `pg`
 * connection stays open for the lifetime of the serverless function
 * instance, which can keep it awake between requests and burn compute-hours
 * for nothing. Neon's own driver adapter connects over its HTTP/WebSocket
 * proxy instead, so it doesn't hold Neon awake between queries — use it
 * whenever DATABASE_URL is actually pointing at Neon, and fall back to
 * plain `pg` for any other Postgres (e.g. local dev).
 */
function createClient() {
  const connectionString = process.env.DATABASE_URL ?? "";
  if (connectionString.includes(".neon.tech")) {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
  }
  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

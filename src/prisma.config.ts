import { defineConfig, env } from "prisma/config";

/*
Neon migration setup:
1. Set NEON_DATABASE_URL to the pooled Neon connection string for runtime traffic.
2. Set NEON_DIRECT_URL to the direct Neon connection string for Prisma migrations.
3. Run Prisma migrate commands with both values present so runtime uses pooling while schema changes bypass the pooler.
*/
export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: {
    path: "src/prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("NEON_DATABASE_URL"),
    directUrl: env("NEON_DIRECT_URL"),
  },
});

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { sql } from "drizzle-orm";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getDb } from "../db/core";
import { getStorageBackend } from "../storage";

function validateEnvironment() {
  if (!process.env.DATABASE_URL?.trim()) throw new Error("DATABASE_URL is required.");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must contain at least 32 characters.");
  const storageRequired = process.env.STORAGE_REQUIRED === "true";
  if (process.env.NODE_ENV === "production" && storageRequired) getStorageBackend();
}

async function startServer() {
  validateEnvironment();
  const app = express();
  const server = createServer(app);
  const startedAt = new Date();

  app.disable("x-powered-by");
  app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || "50mb" }));
  app.use(express.urlencoded({ limit: process.env.REQUEST_BODY_LIMIT || "50mb", extended: true }));

  // Railway health checks must not depend on authentication or the frontend bundle.
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "sbts-professional",
      version: process.env.npm_package_version || "2.0.0-beta.4",
      startedAt: startedAt.toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  });

  app.get("/ready", async (_req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        res.status(503).json({ status: "not_ready", database: "unavailable" });
        return;
      }
      await db.execute(sql`select 1 as ready`);
      res.status(200).json({ status: "ready", database: "connected" });
    } catch (error) {
      console.error("[Readiness] database check failed:", error);
      res.status(503).json({ status: "not_ready", database: "error" });
    }
  });

  registerStorageProxy(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError({ error, path }) {
        console.error(`[tRPC] ${path ?? "unknown"}:`, error.message);
      },
    }),
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number.parseInt(process.env.PORT || "3000", 10);
  if (!Number.isFinite(port) || port <= 0) throw new Error("PORT must be a valid positive integer.");
  const host = process.env.HOST || "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`SBTS server listening on http://${host}:${port}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[Shutdown] ${signal} received.`);
    server.close((error) => {
      if (error) {
        console.error("[Shutdown] server close failed:", error);
        process.exit(1);
      }
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 15_000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error) => {
  console.error("[Startup] fatal error:", error);
  process.exit(1);
});

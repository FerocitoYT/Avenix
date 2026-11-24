-- Axyon Control / Axyon Bot: durable integration deliveries.
-- Additive and idempotent migration to the shared Neon database.
CREATE TABLE IF NOT EXISTS "IntegrationDelivery" (
  "id" TEXT NOT NULL,
  "botId" TEXT NOT NULL,
  "integrationId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastError" TEXT,
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IntegrationDelivery_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "IntegrationDelivery_botId_fkey" FOREIGN KEY ("botId") REFERENCES "BotInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationDelivery_integrationId_eventId_key" ON "IntegrationDelivery" ("integrationId","eventId");
CREATE INDEX IF NOT EXISTS "IntegrationDelivery_status_nextAttemptAt_idx" ON "IntegrationDelivery" ("status","nextAttemptAt");
CREATE INDEX IF NOT EXISTS "IntegrationDelivery_botId_createdAt_idx" ON "IntegrationDelivery" ("botId","createdAt");

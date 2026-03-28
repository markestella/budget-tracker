-- CreateTable
CREATE TABLE "seasonal_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "xpMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "milestones" JSONB NOT NULL,
    "badgeKeys" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasonal_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_seasonal_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonalEventId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "milestonesReached" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_seasonal_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "seasonal_events_startDate_endDate_idx" ON "seasonal_events"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "user_seasonal_progress_userId_idx" ON "user_seasonal_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_seasonal_progress_userId_seasonalEventId_key" ON "user_seasonal_progress"("userId", "seasonalEventId");

-- AddForeignKey
ALTER TABLE "user_seasonal_progress" ADD CONSTRAINT "user_seasonal_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_seasonal_progress" ADD CONSTRAINT "user_seasonal_progress_seasonalEventId_fkey" FOREIGN KEY ("seasonalEventId") REFERENCES "seasonal_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

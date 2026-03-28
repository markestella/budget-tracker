-- CreateEnum
CREATE TYPE "GuildRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "GuildChallengeTarget" AS ENUM ('COLLECTIVE_XP', 'COLLECTIVE_SAVINGS_DAYS', 'ALL_MEMBERS_STREAK');

-- CreateEnum
CREATE TYPE "GuildChallengeStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AchievementEventType" AS ENUM ('LEVEL_UP', 'BADGE_EARNED', 'STREAK_MILESTONE', 'CHALLENGE_COMPLETED', 'HEALTH_SCORE_TIER_UP', 'SAVINGS_MILESTONE');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('MONTHLY', 'SEASONAL', 'SPECIAL_EVENT');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "leaderboard_opt_ins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isOptedIn" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboard_opt_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guilds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "maxMembers" INTEGER NOT NULL DEFAULT 20,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_members" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GuildRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guild_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_challenges" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetType" "GuildChallengeTarget" NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "GuildChallengeStatus" NOT NULL DEFAULT 'ACTIVE',
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guild_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_messages" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guild_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" "AchievementEventType" NOT NULL,
    "displayText" TEXT NOT NULL,
    "metadata" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievement_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_reactions" (
    "id" TEXT NOT NULL,
    "achievementEventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_definitions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "month" INTEGER,
    "seasonStart" TIMESTAMP(3),
    "completionCriteria" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "exclusiveBadgeKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_challenge_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeDefinitionId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_challenge_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_opt_ins_userId_key" ON "leaderboard_opt_ins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "guilds_name_key" ON "guilds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "guilds_inviteCode_key" ON "guilds"("inviteCode");

-- CreateIndex
CREATE INDEX "guild_members_userId_idx" ON "guild_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "guild_members_guildId_userId_key" ON "guild_members"("guildId", "userId");

-- CreateIndex
CREATE INDEX "guild_challenges_guildId_status_idx" ON "guild_challenges"("guildId", "status");

-- CreateIndex
CREATE INDEX "guild_messages_guildId_createdAt_idx" ON "guild_messages"("guildId", "createdAt");

-- CreateIndex
CREATE INDEX "achievement_events_isPublic_createdAt_idx" ON "achievement_events"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "achievement_events_userId_idx" ON "achievement_events"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "feed_reactions_achievementEventId_userId_key" ON "feed_reactions"("achievementEventId", "userId");

-- CreateIndex
CREATE INDEX "challenge_definitions_type_isActive_idx" ON "challenge_definitions"("type", "isActive");

-- CreateIndex
CREATE INDEX "user_challenge_progress_userId_status_idx" ON "user_challenge_progress"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_challenge_progress_userId_challengeDefinitionId_key" ON "user_challenge_progress"("userId", "challengeDefinitionId");

-- AddForeignKey
ALTER TABLE "leaderboard_opt_ins" ADD CONSTRAINT "leaderboard_opt_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guilds" ADD CONSTRAINT "guilds_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_members" ADD CONSTRAINT "guild_members_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_members" ADD CONSTRAINT "guild_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_challenges" ADD CONSTRAINT "guild_challenges_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_messages" ADD CONSTRAINT "guild_messages_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_messages" ADD CONSTRAINT "guild_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_events" ADD CONSTRAINT "achievement_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_reactions" ADD CONSTRAINT "feed_reactions_achievementEventId_fkey" FOREIGN KEY ("achievementEventId") REFERENCES "achievement_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_reactions" ADD CONSTRAINT "feed_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_challenge_progress" ADD CONSTRAINT "user_challenge_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_challenge_progress" ADD CONSTRAINT "user_challenge_progress_challengeDefinitionId_fkey" FOREIGN KEY ("challengeDefinitionId") REFERENCES "challenge_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

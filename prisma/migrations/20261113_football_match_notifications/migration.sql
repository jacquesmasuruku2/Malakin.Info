CREATE TABLE IF NOT EXISTS "FollowedFootballTeam" (
  "id" STRING NOT NULL,
  "userId" STRING NOT NULL,
  "espnTeamId" STRING NOT NULL,
  "name" STRING NOT NULL,
  "logo" STRING,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FollowedFootballTeam_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FollowedFootballTeam_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE INDEX "FollowedFootballTeam_userId_espnTeamId_key" ("userId", "espnTeamId"),
  INDEX "FollowedFootballTeam_espnTeamId_idx" ("espnTeamId")
);

CREATE TABLE IF NOT EXISTS "WebPushSubscription" (
  "id" STRING NOT NULL,
  "userId" STRING NOT NULL,
  "endpoint" STRING NOT NULL,
  "p256dh" STRING NOT NULL,
  "auth" STRING NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebPushSubscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WebPushSubscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE INDEX "WebPushSubscription_endpoint_key" ("endpoint"),
  INDEX "WebPushSubscription_userId_idx" ("userId")
);

CREATE INDEX IF NOT EXISTS "WebPushSubscription_userId_idx"
  ON "WebPushSubscription" ("userId");

CREATE TABLE IF NOT EXISTS "MatchReminderDelivery" (
  "id" STRING NOT NULL,
  "userId" STRING NOT NULL,
  "espnEventId" STRING NOT NULL,
  "kickoffAt" TIMESTAMP(3) NOT NULL,
  "claimedAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MatchReminderDelivery_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MatchReminderDelivery_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE INDEX "MatchReminderDelivery_userId_espnEventId_key" ("userId", "espnEventId"),
  INDEX "MatchReminderDelivery_kickoffAt_idx" ("kickoffAt")
);

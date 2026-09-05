ALTER TABLE "Donation" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Donation_stripeSessionId_key" ON "Donation"("stripeSessionId");
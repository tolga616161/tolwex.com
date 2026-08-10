-- AlterTable
ALTER TABLE "Member" ADD COLUMN "registerIp" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Member" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Member" ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Member" ADD COLUMN "emailOtp" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Member" ADD COLUMN "phoneOtp" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Member" ADD COLUMN "otpExpiresAt" DATETIME;
ALTER TABLE "Member" ADD COLUMN "welcomeBonusAt" DATETIME;

-- CreateIndex
CREATE INDEX "Member_registerIp_idx" ON "Member"("registerIp");
CREATE INDEX "Member_phone_idx" ON "Member"("phone");

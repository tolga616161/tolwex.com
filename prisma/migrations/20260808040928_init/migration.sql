-- CreateTable
CREATE TABLE "MetaConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL DEFAULT '',
    "encryptedAppSecret" TEXT NOT NULL DEFAULT '',
    "redirectUri" TEXT NOT NULL DEFAULT '',
    "domain" TEXT NOT NULL DEFAULT '',
    "apiVersion" TEXT NOT NULL DEFAULT 'v21.0',
    "webhookVerifyToken" TEXT NOT NULL DEFAULT '',
    "configured" BOOLEAN NOT NULL DEFAULT false,
    "lastTestAt" DATETIME,
    "lastTestOk" BOOLEAN,
    "lastTestMessage" TEXT,
    "lastApiRequestAt" DATETIME,
    "lastApiError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VisitorSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InstagramConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorSessionId" TEXT NOT NULL,
    "metaUserId" TEXT,
    "igUsername" TEXT,
    "igUserId" TEXT,
    "accountType" TEXT,
    "encryptedAccessToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "grantedScopes" TEXT NOT NULL DEFAULT '[]',
    "tokenStatus" TEXT NOT NULL DEFAULT 'none',
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckedAt" DATETIME,
    "lastApiError" TEXT,
    "lastApiErrorCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "disconnectedAt" DATETIME,
    CONSTRAINT "InstagramConnection_visitorSessionId_fkey" FOREIGN KEY ("visitorSessionId") REFERENCES "VisitorSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "visitorSessionId" TEXT NOT NULL,
    "twoFactorEnabled" BOOLEAN,
    "emailSecure" BOOLEAN,
    "phoneUpToDate" BOOLEAN,
    "unknownDevices" BOOLEAN,
    "suspiciousApps" BOOLEAN,
    "strongPassword" BOOLEAN,
    "backupCodesSafe" BOOLEAN,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecurityChecklist_visitorSessionId_fkey" FOREIGN KEY ("visitorSessionId") REFERENCES "VisitorSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "actorType" TEXT NOT NULL DEFAULT 'system',
    "actorId" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "InstagramConnection_visitorSessionId_key" ON "InstagramConnection"("visitorSessionId");

-- CreateIndex
CREATE INDEX "InstagramConnection_metaUserId_idx" ON "InstagramConnection"("metaUserId");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityChecklist_visitorSessionId_key" ON "SecurityChecklist"("visitorSessionId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

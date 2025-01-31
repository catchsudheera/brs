-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "groups" JSONB NOT NULL,
    "scores" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT'
);

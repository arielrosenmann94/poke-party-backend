-- CreateTable
CREATE TABLE "Pokemon" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sprite" TEXT,
    "types" JSONB NOT NULL,
    "stats" JSONB NOT NULL,
    "box" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("id")
);

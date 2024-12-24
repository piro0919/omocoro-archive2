/*
  Warnings:

  - Made the column `thumbnail` on table `Article` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profileUrl` on table `Writer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `avatarUrl` on table `Writer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "thumbnail" SET NOT NULL;

-- AlterTable
ALTER TABLE "Writer" ALTER COLUMN "profileUrl" SET NOT NULL,
ALTER COLUMN "avatarUrl" SET NOT NULL;

/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Writer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Writer_name_key" ON "Writer"("name");

/*
  Warnings:

  - You are about to drop the column `writerId` on the `Article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_writerId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP COLUMN "writerId";

-- CreateTable
CREATE TABLE "_ArticleToWriter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArticleToWriter_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ArticleToWriter_B_index" ON "_ArticleToWriter"("B");

-- AddForeignKey
ALTER TABLE "_ArticleToWriter" ADD CONSTRAINT "_ArticleToWriter_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToWriter" ADD CONSTRAINT "_ArticleToWriter_B_fkey" FOREIGN KEY ("B") REFERENCES "Writer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

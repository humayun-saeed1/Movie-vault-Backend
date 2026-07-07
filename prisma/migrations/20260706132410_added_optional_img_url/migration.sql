/*
  Warnings:

  - Changed the type of `age` on the `Actors` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `age` on the `Director` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Actors" DROP COLUMN "age",
ADD COLUMN     "age" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Director" DROP COLUMN "age",
ADD COLUMN     "age" INTEGER NOT NULL;

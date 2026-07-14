-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Actors" ADD COLUMN     "createrId" TEXT NOT NULL DEFAULT 'cmrkgd3v20000a8utroj50ioq',
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Director" ADD COLUMN     "createrId" TEXT NOT NULL DEFAULT 'cmrkgd3v20000a8utroj50ioq',
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "createrId" TEXT NOT NULL DEFAULT 'cmrkgd3v20000a8utroj50ioq',
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_createrId_fkey" FOREIGN KEY ("createrId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Actors" ADD CONSTRAINT "Actors_createrId_fkey" FOREIGN KEY ("createrId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Director" ADD CONSTRAINT "Director_createrId_fkey" FOREIGN KEY ("createrId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

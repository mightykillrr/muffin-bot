/*
  Warnings:

  - The primary key for the `MovieNight` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MovieNight` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_movie_night_id_fkey";

-- DropForeignKey
ALTER TABLE "_MovieToMovieNight" DROP CONSTRAINT "_MovieToMovieNight_B_fkey";

-- DropIndex
DROP INDEX "MovieNight_message_id_key";

-- AlterTable
ALTER TABLE "MovieNight" DROP CONSTRAINT "MovieNight_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "MovieNight_pkey" PRIMARY KEY ("message_id");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_movie_night_id_fkey" FOREIGN KEY ("movie_night_id") REFERENCES "MovieNight"("message_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToMovieNight" ADD CONSTRAINT "_MovieToMovieNight_B_fkey" FOREIGN KEY ("B") REFERENCES "MovieNight"("message_id") ON DELETE CASCADE ON UPDATE CASCADE;

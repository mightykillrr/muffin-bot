/*
  Warnings:

  - You are about to drop the column `votes_appeared_ids` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `movie_ids` on the `MovieNight` table. All the data in the column will be lost.
  - Changed the type of `ends_at` on the `MovieNight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "votes_appeared_ids";

-- AlterTable
ALTER TABLE "MovieNight" DROP COLUMN "movie_ids",
DROP COLUMN "ends_at",
ADD COLUMN     "ends_at" INTEGER NOT NULL;

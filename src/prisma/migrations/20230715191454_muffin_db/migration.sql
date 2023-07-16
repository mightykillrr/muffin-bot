/*
  Warnings:

  - The primary key for the `Movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `movieNightId` on the `Movie` table. All the data in the column will be lost.
  - The primary key for the `MovieNight` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `movies_id` on the `MovieNight` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[message_id]` on the table `MovieNight` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image_link` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `info_link` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `watched_on` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message_id` to the `MovieNight` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_movieNightId_fkey";

-- AlterTable
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_pkey",
DROP COLUMN "movieNightId",
ADD COLUMN     "image_link" TEXT NOT NULL,
ADD COLUMN     "info_link" TEXT NOT NULL,
ADD COLUMN     "is_watched" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "votes_appeared_ids" TEXT[],
ADD COLUMN     "watched_on" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Movie_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Movie_id_seq";

-- AlterTable
ALTER TABLE "MovieNight" DROP CONSTRAINT "MovieNight_pkey",
DROP COLUMN "movies_id",
ADD COLUMN     "message_id" TEXT NOT NULL,
ADD COLUMN     "movie_ids" TEXT[],
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "MovieNight_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MovieNight_id_seq";

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "movie_id" TEXT NOT NULL,
    "movie_night_id" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MovieToMovieNight" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MovieToMovieNight_AB_unique" ON "_MovieToMovieNight"("A", "B");

-- CreateIndex
CREATE INDEX "_MovieToMovieNight_B_index" ON "_MovieToMovieNight"("B");

-- CreateIndex
CREATE UNIQUE INDEX "MovieNight_message_id_key" ON "MovieNight"("message_id");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_movie_night_id_fkey" FOREIGN KEY ("movie_night_id") REFERENCES "MovieNight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToMovieNight" ADD CONSTRAINT "_MovieToMovieNight_A_fkey" FOREIGN KEY ("A") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MovieToMovieNight" ADD CONSTRAINT "_MovieToMovieNight_B_fkey" FOREIGN KEY ("B") REFERENCES "MovieNight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

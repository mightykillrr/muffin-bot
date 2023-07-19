/*
  Warnings:

  - The primary key for the `MovieNightReminder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MovieNightReminder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MovieNightReminder" DROP CONSTRAINT "MovieNightReminder_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "MovieNightReminder_pkey" PRIMARY KEY ("movie_night_id");

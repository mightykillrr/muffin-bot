/*
  Warnings:

  - Added the required column `channel_id` to the `MovieNight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MovieNight" ADD COLUMN     "channel_id" TEXT NOT NULL;

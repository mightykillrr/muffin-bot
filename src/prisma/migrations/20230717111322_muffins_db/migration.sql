/*
  Warnings:

  - Added the required column `ends_at` to the `MovieNight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MovieNight" ADD COLUMN     "ends_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "MovieNightReminder" (
    "id" TEXT NOT NULL,
    "movie_night_id" TEXT NOT NULL,
    "reminder_at" INTEGER NOT NULL,

    CONSTRAINT "MovieNightReminder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MovieNightReminder" ADD CONSTRAINT "MovieNightReminder_movie_night_id_fkey" FOREIGN KEY ("movie_night_id") REFERENCES "MovieNight"("message_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Movie" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "movieNightId" INTEGER,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieNight" (
    "id" SERIAL NOT NULL,
    "movies_id" INTEGER[],

    CONSTRAINT "MovieNight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_movieNightId_fkey" FOREIGN KEY ("movieNightId") REFERENCES "MovieNight"("id") ON DELETE SET NULL ON UPDATE CASCADE;

import dayjs from "dayjs";
import { prisma } from "../../../prisma/db";
import { handleMovieRemindersAdd } from "../../../commands/slash/movienight/helpers";

export const handleMovieNightsReminders = async () => {
  const currentUnix = dayjs().unix();
  const activeMovieNightReminders = await prisma.movieNightReminder.findMany({
    where: { reminder_at: { gt: currentUnix } },
    include: { movie_night: { include: { movies: true, votes: true } } },
  });

  const movieNightReminders = activeMovieNightReminders.map(
    async (movieNightReminder) => {
      const { movie_night } = movieNightReminder;
      await handleMovieRemindersAdd(movie_night);
    },
  );

  await Promise.all(movieNightReminders);
};

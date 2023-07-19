import dayjs from "dayjs";
import { prisma } from "../../../prisma/db";
import {
  getStreamingTime,
  handleMovieRemindersAdd,
} from "../../../commands/slash/movienight/helpers";

export const handleMovieNightsReminders = async () => {
  const currentUnix = dayjs().unix();
  const activeMovieNightReminders = await prisma.movieNightReminder.findMany({
    where: { reminder_at: { gt: currentUnix } },
    include: { movie_night: { include: { movies: true, votes: true } } },
  });

  const movieNightReminders = activeMovieNightReminders.map(
    async (movieNightReminder) => {
      const { movie_night, reminder_at } = movieNightReminder;
      const timeStreamed = getStreamingTime(movie_night.ends_at);
      await handleMovieRemindersAdd(movie_night, timeStreamed);
    },
  );

  await Promise.all(movieNightReminders);
};

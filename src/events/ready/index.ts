import { Event } from "../../types";
import { logger } from "../../logger";
import { handleMovieNightsLoading } from "./initJobs/movieNight";
import { handleMovieNightsReminders } from "./initJobs/movieStreamReminders";

export const event: Event<"ready"> = {
  event: "ready",
  run: async () => {
    logger.complete("The bot is connected and ready!");
    logger.await("Starting initialisation jobs...");

    await handleMovieNightsLoading();
    logger.success("Movie nights initialisation completed!");
    await handleMovieNightsReminders();
    logger.success("Movie nights reminders initialisation completed!");

    logger.complete("Initialisation jobs completed!");
  },
};

export default event;

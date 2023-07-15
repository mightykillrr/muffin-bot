import { Event } from "../../types";
import { logger } from "../../logger";

export const event: Event<"ready"> = {
  event: "ready",
  run: async () => {
    logger.complete("The bot is connected and ready!");
  },
};

export default event;

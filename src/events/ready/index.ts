import { Event } from "../../types";
import { logger } from "../../logger";
import dayjs from "dayjs";
import { prisma } from "../../prisma/db";
import { ExtendedClient } from "../../structures/Client";
import { client } from "../../main";
import { addCollectorToMovieNight } from "../../commands/slash/movienight/helpers";

export const event: Event<"ready"> = {
  event: "ready",
  run: async () => {
    const currentUnix = dayjs().unix();
    const activeMovieNights = await prisma.movieNight.findMany({
      where: { ends_at: { gt: currentUnix } },
      include: { votes: true },
    });

    const movieNights = activeMovieNights.map(async (movieNight) => {
      const messageID = movieNight.message_id;
      const message = await getMessage(
        messageID,
        movieNight.channel_id,
        client,
      );
      if (!message) return;
      await addCollectorToMovieNight(movieNight, message);
    });

    await Promise.all(movieNights);

    logger.complete("The bot is connected and ready!");
  },
};

const getMessage = async (
  messageID: string,
  channelID: string,
  client: ExtendedClient,
) => {
  const channel = client.channels.cache.get(channelID);
  if (!channel) return null;
  if (!channel.isTextBased()) return null;

  return channel.messages.fetch(messageID);
};

export default event;

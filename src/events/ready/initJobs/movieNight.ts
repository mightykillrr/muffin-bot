import dayjs from "dayjs";
import { prisma } from "../../../prisma/db";
import { client } from "../../../main";
import { addCollectorToMovieNight } from "../../../commands/slash/movienight/helpers";
import { ExtendedClient } from "../../../structures/Client";

export const handleMovieNightsLoading = async () => {
  const currentUnix = dayjs().unix();
  const activeMovieNights = await prisma.movieNight.findMany({
    where: { ends_at: { gt: currentUnix } },
    include: { votes: true },
  });

  console.log({ activeMovieNights });

  const movieNights = activeMovieNights.map(async (movieNight) => {
    const messageID = movieNight.message_id;
    const message = await getMessage(messageID, movieNight.channel_id, client);
    if (!message) return;
    await addCollectorToMovieNight(movieNight, message);
  });

  await Promise.all(movieNights);
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

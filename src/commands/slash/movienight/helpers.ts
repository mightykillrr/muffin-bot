import dayjs from "dayjs";
import { ButtonInteraction, ComponentType, Message } from "discord.js";
import type { Movie, MovieNight } from "@prisma/client";
import { prisma } from "../../../prisma/db";

export const handleVoteAddResponse = async (
  res: Awaited<ReturnType<typeof addVoteToDB>>,
  interaction: ButtonInteraction,
) => {
  if (res.hasVotedBefore) {
    if (res.isSameMovieVote) {
      await interaction.reply({
        content: "You have already voted for this movie!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Your vote has been changed!",
        ephemeral: true,
      });
    }
  } else {
    await interaction.reply({
      content: "Your vote has been added!",
      ephemeral: true,
    });
  }
};

export const addMovieNightToDB = async (
  movies: Array<Movie>,
  messageID: string,
  channelID: string,
  endsAt: number,
) => {
  await prisma.movieNight.create({
    data: {
      message_id: messageID,
      ends_at: endsAt,
      channel_id: channelID,
      movies: {
        connect: movies.map((movie) => ({ id: movie.id })),
      },
    },
  });
};

export const addVoteToDB = async (
  movieID: string,
  userID: string,
  messageID: string,
) => {
  const vote = await prisma.vote.findFirst({
    where: {
      user_id: userID,
      movie_night_id: messageID,
    },
  });

  const res = {
    hasVotedBefore: !!vote,
    isSameMovieVote: false,
  };

  if (vote) {
    await prisma.vote.update({
      where: {
        id: vote.id,
      },
      data: {
        movie_id: movieID,
        user_id: userID,
        movie_night_id: messageID,
      },
    });

    res.isSameMovieVote = vote.movie_id === movieID;
  } else {
    await prisma.vote.create({
      data: {
        movie_id: movieID,
        user_id: userID,
        movie_night_id: messageID,
      },
    });
  }

  return res;
};

export const handleMovieVote = async (
  message: Message<boolean>,
  secondsUntilVoteEnd: number,
) => {
  const collector = message.createMessageComponentCollector({
    time: secondsUntilVoteEnd,
    componentType: ComponentType.Button,
  });

  collector.on("collect", async (i) => {
    const movieID = i.customId;
    const res = await addVoteToDB(movieID, i.user.id, message.id);
    await handleVoteAddResponse(res, i);
  });

  // collector.on("end", async () => {}
};

export const addCollectorToMovieNight = async (
  movieNight: MovieNight,
  message: Message<boolean>,
) => {
  const timeUntilEnd = movieNight.ends_at;
  const secondsUntilEnd = dayjs.unix(timeUntilEnd).diff(dayjs(), "seconds");

  await handleMovieVote(message, secondsUntilEnd);
};

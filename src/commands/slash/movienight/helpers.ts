import dayjs from "dayjs";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Message,
  MessageActionRowComponentBuilder,
  MessageCreateOptions,
} from "discord.js";
import type { Movie, MovieNight, Vote } from "@prisma/client";
import { prisma } from "../../../prisma/db";
import { createMessageURL } from "../../functions";
import {
  createMovieVotesEmbed,
  MovieNightWithVotesAndMovies,
} from "../checkvotes/helpers";
import { client } from "../../../main";
import { movieNightSettings } from "../../../config";

export const handleVoteAddResponse = async (
  res: Awaited<ReturnType<typeof addVoteToDB>>,
  interaction: ButtonInteraction,
) => {
  if (res.isBanned) {
    await interaction.reply({
      content: "You are banned from voting in movie nights!",
      ephemeral: true,
    });
    return;
  }
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
  guildID: string,
  endsAt: number,
) => {
  await prisma.movieNight.create({
    data: {
      message_id: messageID,
      ends_at: endsAt,
      channel_id: channelID,
      guild_id: guildID,
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
  const res = {
    hasVotedBefore: false,
    isSameMovieVote: false,
    isBanned: false,
  };

  const isBanned = await prisma.movieNightBlacklist.findFirst({
    where: { user_id: userID },
  });

  if (isBanned) {
    res.isBanned = true;
    return res;
  }

  const vote = await prisma.vote.findFirst({
    where: {
      user_id: userID,
      movie_night_id: messageID,
    },
  });
  res.hasVotedBefore = !!vote;

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

export const createMoviesActionRow = (
  movies: Array<Movie>,
  isHorizontal = false,
  winnerMovieID?: string,
) => {
  if (isHorizontal) {
    const buttons = movies.map((movie) => {
      const btn = new ButtonBuilder()
        .setCustomId(movie.id)
        .setLabel(movie.title)
        .setStyle(
          movie.id === winnerMovieID
            ? ButtonStyle.Success
            : ButtonStyle.Primary,
        )
        .setDisabled(!!winnerMovieID);

      if (winnerMovieID) {
        if (winnerMovieID === movie.id) {
          btn.setStyle(ButtonStyle.Success);
        } else {
          btn.setStyle(ButtonStyle.Secondary);
        }
      } else {
        btn.setStyle(ButtonStyle.Primary);
      }
      return btn;
    });

    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        ...buttons,
      );
    return [row];
  } else {
    return movies.map((movie) => {
      return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(movie.id)
          .setLabel(movie.title)
          .setStyle(ButtonStyle.Primary),
      );
    });
  }
};

export const getStreamingTime = (unixTime?: number): number => {
  const timeStreamed = unixTime ? dayjs.unix(unixTime) : dayjs();
  return timeStreamed
    .set("second", 0)
    .set("millisecond", 0)
    .set("minute", 0)
    .set("hour", 21)
    .add(1, "day")
    .unix();
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

  collector.on("end", async () => {
    const movieNight = await prisma.movieNight.findFirst({
      where: { message_id: message.id },
      include: { movies: true, votes: true },
    });

    if (!movieNight) return;

    const { message_id, channel_id, guild_id, movies, votes } = movieNight;
    const winnerMovie = getWinnerMovie(movies, votes);
    const messageURL = createMessageURL(guild_id, channel_id, message_id);
    const timeStreamed = getStreamingTime();

    const moviesRow = createMoviesActionRow(
      movieNight.movies,
      true,
      winnerMovie.id,
    );
    await message.edit({ components: moviesRow });

    // SEND OWNER DM
    const winnerEmbed = createWinnerMovieEmbed(
      winnerMovie,
      timeStreamed,
      messageURL,
      true,
    );
    const votesEmbed = createMovieVotesEmbed(movieNight);
    await sendMessageToOwners({ embeds: [winnerEmbed, votesEmbed] });
    await prisma.movieNightReminder.create({
      data: {
        movie_night_id: movieNight.message_id,
        reminder_at: timeStreamed,
      },
    });
    await handleMovieRemindersAdd(movieNight, timeStreamed);

    // MOVIE NIGHT ANNOUNCEMENT
    const mainEmbed = createWinnerMovieEmbed(
      winnerMovie,
      timeStreamed,
      messageURL,
    );
    const suggestionsEmbed = new EmbedBuilder().setDescription(
      "Also give your movie suggestions in <#736683960062574635>. " +
        "Check `/movies` before suggesting to check whether " +
        "your movie has already been watched. ❣️",
    );
    const roleMention = "<@&736682166762864671>";
    const { announcementChannelID } = movieNightSettings;
    const announcementChannel = client.channels.cache.get(
      announcementChannelID,
    );

    if (announcementChannel?.isTextBased()) {
      await announcementChannel.send({
        content: roleMention,
        embeds: [mainEmbed, suggestionsEmbed],
        allowedMentions: { parse: ["roles"] },
      });
    }

    await prisma.movie.update({
      where: { id: winnerMovie.id },
      data: { is_watched: true, movie_vote_won_id: message_id },
    });
  });
};

export const handleMovieRemindersAdd = async (
  movieNight: MovieNightWithVotesAndMovies,
  time: number,
) => {
  const timeLeft = getTimeLeftUntilStream(time);
  // const timeLeft = dayjs().add(1, "minute").diff(dayjs(), "millisecond");
  const embed = new EmbedBuilder()
    .setDescription("You have a movie to stream in an hour. Be prepared!")
    .setColor("Random");

  setTimeout(async () => {
    await sendMessageToOwners({ embeds: [embed] });
    await prisma.movieNightReminder.delete({
      where: { movie_night_id: movieNight.message_id },
    });
  }, timeLeft);
};

const sendMessageToOwners = async (payload: MessageCreateOptions) => {
  const ownerIDs = process.env.OWNERS?.split(",") as Array<string>;
  const ownerPromises = ownerIDs.map(async (id) => client.users.fetch(id));
  const owners = await Promise.all(ownerPromises);
  const messagePromises = owners.map(async (owner) => {
    await owner.send(payload);
  });
  await Promise.all(messagePromises);
};

const getTimeLeftUntilStream = (timeEnds: number) => {
  const endingTime = dayjs.unix(timeEnds);
  const hourBeforeEnd = endingTime.subtract(1, "hour");

  return hourBeforeEnd.diff(dayjs(), "milliseconds");
};

export const addCollectorToMovieNight = async (
  movieNight: MovieNight,
  message: Message<boolean>,
) => {
  const timeUntilEnd = movieNight.ends_at;
  const secondsUntilEnd = dayjs
    .unix(timeUntilEnd)
    .diff(dayjs(), "milliseconds");

  await handleMovieVote(message, secondsUntilEnd);
};

const getWinnerMovie = (movies: Array<Movie>, votes: Array<Vote>) => {
  const movieVotes = new Map<Movie["id"], number>();
  movies.forEach((movie) => movieVotes.set(movie.id, 0));
  votes.forEach((vote) => {
    const movieID = vote.movie_id as Movie["id"];
    const currentVotes = movieVotes.get(movieID) as number;
    movieVotes.set(movieID, currentVotes + 1);
  });

  const sortedMovieVotes = [...movieVotes.entries()].sort(
    (a, b) => b[1] - a[1],
  );
  const winnerMovieID = sortedMovieVotes[0][0];

  return movies.find((movie) => movie.id === winnerMovieID) as Movie;
};

const createWinnerMovieEmbed = (
  movie: Movie,
  timeStreamed: number,
  messageURL: string,
  isForOwner = false,
) => {
  const winnerDesc = `${movie.title} has won this [movie night's](${messageURL}) vote!`;
  const time = `<t:${timeStreamed}:${isForOwner ? "R" : "f"}>`;
  const streamedOnDesc = `The movie will be streamed on ${time}.${
    isForOwner ? "" : " Hoping to see you there!"
  }`;

  const desc = `${winnerDesc} ${streamedOnDesc}`;

  const embed = new EmbedBuilder();
  embed.setDescription(desc);
  embed.setImage(movie.image_link);
  embed.setURL(movie.info_link);
  embed.setTitle(movie.title);
  embed.setColor("#00FFFF");

  return embed;
};

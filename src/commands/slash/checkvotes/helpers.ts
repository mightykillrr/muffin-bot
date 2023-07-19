import { Movie, Prisma, Vote } from "@prisma/client";
import { EmbedBuilder } from "discord.js";
import { createMessageURL } from "../../functions";

export type MovieNightWithVotesAndMovies = Prisma.MovieNightGetPayload<{
  include: { votes: true; movies: true };
}>;

type MovieVotesAndData = {
  votes: Array<Vote>;
  movie: Movie;
};

export const createMovieVotesEmbed = (
  movieNight: MovieNightWithVotesAndMovies,
) => {
  const data = new Map<string, MovieVotesAndData>();

  movieNight.movies.forEach((movie) => {
    data.set(movie.id, { votes: [], movie });
  });
  movieNight.votes.forEach((vote) => {
    data.get(vote.movie_id)?.votes.push(vote);
  });

  const embed = new EmbedBuilder();
  embed.setTitle("Movie Night votes");

  const { message_id, channel_id, guild_id } = movieNight;
  const messageURL = createMessageURL(guild_id, channel_id, message_id);
  embed.setURL(messageURL);

  const movieFields = createMovieFields(data);
  embed.addFields(...movieFields);

  return embed;
};

export const createMovieFields = (
  movieData: Map<string, MovieVotesAndData>,
) => {
  return [...movieData.entries()].map(([, data]) => {
    const votesCount = data.votes.length;
    const votes =
      data.votes.map((vote) => `_<@${vote.user_id}>_`).join("\n") ||
      "No votes yet!";

    return {
      name: `${data.movie.title} (${votesCount} vote${
        votesCount === 1 ? "" : "s"
      })`,
      value: votes,
      inline: true,
    };
  });
};

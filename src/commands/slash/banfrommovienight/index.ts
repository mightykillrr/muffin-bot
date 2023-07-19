import type { SlashCommandType } from "../../../types";
import { ApplicationCommandOptionType, TextInputStyle } from "discord.js";
import { Movie, Vote } from "@prisma/client";
import { prisma } from "../../../prisma/db";

type MovieVotesAndData = {
  votes: Array<Vote>;
  movie: Movie;
};

const command: SlashCommandType = {
  name: "ban_from_movie_night",
  description: "Ban a user from voting in movie nights",
  ownerOnly: true,
  options: [
    {
      name: "user_id",
      description: "Enter the user ID to ban from voting in movie nights",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async ({ interaction }) => {
    const userID = interaction.options.get("user_id")?.value as string;
    const isBanned = await prisma.movieNightBlacklist.create({
      data: { user_id: userID },
    });

    if (isBanned) {
      await interaction.followUp({ content: "User was already banned!" });
    } else {
      await interaction.followUp({
        content: "User has been banned from voting in movie nights.",
      });
    }
  },
};

export default command;

import type { SlashCommandType } from "../../../types";
import { ApplicationCommandOptionType, TextInputStyle } from "discord.js";
import { prisma } from "../../../prisma/db";
import { Movie, Vote } from "@prisma/client";

type MovieVotesAndData = {
  votes: Array<Vote>;
  movie: Movie;
};

const command: SlashCommandType = {
  name: "remove_vote",
  description: "Check votes for a movie night",
  ownerOnly: true,
  options: [
    {
      name: "message_id",
      description: "Enter the message ID of the movie night",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "user_id",
      description: "Enter the user ID to delete vote of",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async ({ interaction }) => {
    const messageID = interaction.options.get("message_id")?.value as string;
    const userID = interaction.options.get("user_id")?.value as string;

    const vote = await prisma.vote.findFirst({
      where: { user_id: userID, movie_night_id: messageID },
    });

    if (!vote) {
      return interaction.followUp({
        content: "Vote not found! The Message ID or User ID might be wrong.",
        ephemeral: true,
      });
    } else {
      await prisma.vote.delete({ where: { id: vote.id } });
      return interaction.followUp({ content: "Vote deleted!" });
    }
  },
};

export default command;

import type { SlashCommandType } from "../../../types";
import { ApplicationCommandOptionType, TextInputStyle } from "discord.js";
import { prisma } from "../../../prisma/db";
import { createMovieVotesEmbed } from "./helpers";

const command: SlashCommandType = {
  name: "check_votes",
  description: "Check votes for a movie night",
  ownerOnly: true,
  ephemeral: true,
  options: [
    {
      name: "message_id",
      description: "Enter the message ID of the movie night",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async ({ interaction }) => {
    const messageID = interaction.options.get("message_id")?.value as string;

    const movieNight = await prisma.movieNight.findFirst({
      where: { message_id: messageID },
      include: { votes: true, movies: true },
    });

    if (!movieNight) {
      return interaction.reply({
        content: "Movie night not found! The message ID might be wrong.",
        ephemeral: true,
      });
    }

    const embed = createMovieVotesEmbed(movieNight);

    return interaction.followUp({ embeds: [embed], ephemeral: true });
  },
};

export default command;

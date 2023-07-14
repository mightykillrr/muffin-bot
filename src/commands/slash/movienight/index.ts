import type { SlashCommandType } from "../../../types";

const command: SlashCommandType = {
  name: "movie_night",
  description: "Create a movie night!",
  run: async ({ interaction }) => {
    await interaction.followUp({
      content: "This is a movie night!",
      ephemeral: true,
    });
  },
};

export default command;

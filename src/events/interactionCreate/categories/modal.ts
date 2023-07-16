import { ModalTypes } from "../../../types";
import { ModalSubmitInteraction } from "discord.js";
import { handleMovieNightModal } from "../modals/MovieNight";
import { handleAddNewMovie } from "../modals/AddMovie";

export const handleModal = async (interaction: ModalSubmitInteraction) => {
  if (interaction.isModalSubmit()) {
    await interaction.deferReply({ ephemeral: true });

    const { customId: modalType } = interaction;

    switch (modalType) {
      case ModalTypes.MovieNight:
        await handleMovieNightModal(interaction);
        break;
      case ModalTypes.AddMovie:
        await handleAddNewMovie(interaction);
        break;
    }
  }
};

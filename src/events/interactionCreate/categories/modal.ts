import { ModalTypes } from "../../../types";
import { ModalSubmitInteraction } from "discord.js";
import { handleMovieNightModal } from "../modals/MovieNight";

export const handleModal = async (interaction: ModalSubmitInteraction) => {
  if (interaction.isModalSubmit()) {
    await interaction.deferReply({ ephemeral: true });

    const { customId: modalType } = interaction;

    switch (modalType) {
      case ModalTypes.MovieNight:
        await handleMovieNightModal(interaction);
        break;
    }
  }
};

import type { Event } from "../../types";
import { handleCommand } from "./categories/command";
import { handleModal } from "./categories/modal";

const event: Event<"interactionCreate"> = {
  event: "interactionCreate",
  run: async (interaction) => {
    if (interaction.isCommand()) {
      await handleCommand(interaction);
    } else if (interaction.isModalSubmit()) await handleModal(interaction);
  },
};

export default event;

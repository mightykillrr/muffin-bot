import type { SlashCommandType } from "../../../types";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  CommandInteractionOption,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

const command: SlashCommandType = {
  name: "movie_night",
  description: "Create a movie night!",
  consumeInstantly: true,
  ownerOnly: true,
  options: [
    {
      name: "movie_count",
      description: "Enter the no. of movies you want for the vote(2-4)",
      required: true,
      type: ApplicationCommandOptionType.Number,
      minValue: 2,
      maxValue: 4,
    },
  ],
  run: async ({ interaction }) => {
    const { value: noOfMovies } = interaction.options.get(
      "movie_count",
      true,
    ) as CommandInteractionOption & { value: number };

    const numberToString: Record<number, string> = {
      1: "First",
      2: "Second",
      3: "Third",
      4: "Fourth",
    };

    const fields: Array<ActionRowBuilder<TextInputBuilder>> = [];
    for (let i = 0; i < noOfMovies; i++) {
      const count = i + 1;
      const inputField = new TextInputBuilder()
        .setCustomId(`movie_${count}`)
        .setLabel(`${numberToString[count]} Movie`)
        .setPlaceholder(
          `Enter the ${numberToString[count].toLowerCase()} movie name`,
        )
        .setRequired(true)
        .setValue(`Movie ${count}`)
        .setStyle(TextInputStyle.Short);

      const actionRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          inputField,
        );

      fields.push(actionRow);
    }

    const hours = new TextInputBuilder()
      .setCustomId("hours")
      .setLabel("Hours for the vote (default 24)")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(2)
      .setValue("24")
      .setPlaceholder("Enter the no. of hours for the vote");

    const finalRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        hours,
      );
    fields.push(finalRow);

    const modal = new ModalBuilder()
      .setTitle("Create a Movie Night!")
      .setCustomId("movie_night")
      .addComponents(...fields);

    await interaction.showModal(modal);
  },
};

export default command;

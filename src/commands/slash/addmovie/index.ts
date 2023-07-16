import type { SlashCommandType } from "../../../types";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

const command: SlashCommandType = {
  name: "add_movie",
  description: "Add a new Movie",
  consumeInstantly: true,
  ownerOnly: true,
  run: async ({ interaction }) => {
    const movieNameBox = new TextInputBuilder()
      .setCustomId("movie_name")
      .setLabel("Movie Name")
      .setPlaceholder("Enter the movie name")
      .setRequired(true)
      .setStyle(TextInputStyle.Short);
    const movieNameRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        movieNameBox,
      );

    const linkToInfo = new TextInputBuilder()
      .setCustomId("info_link")
      .setLabel("Info Link")
      .setPlaceholder("Enter a link to page with the movie's information")
      .setRequired(true)
      .setStyle(TextInputStyle.Short);
    const infoLinkRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        linkToInfo,
      );

    const linkToImage = new TextInputBuilder()
      .setCustomId("image_link")
      .setLabel("Image Link")
      .setPlaceholder("Enter a link to movie's cover image")
      .setRequired(true)
      .setStyle(TextInputStyle.Short);
    const imageLinkRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        linkToImage,
      );

    const movieDescription = new TextInputBuilder()
      .setCustomId("movie_description")
      .setLabel("Movie Description")
      .setPlaceholder("Enter a description for the movie")
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);
    const movieDescriptionRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        movieDescription,
      );

    const modal = new ModalBuilder()
      .setTitle("Add a new movie")
      .setCustomId("add_movie")
      .addComponents(
        movieNameRow,
        infoLinkRow,
        imageLinkRow,
        movieDescriptionRow,
      );

    await interaction.showModal(modal);
  },
};

export default command;

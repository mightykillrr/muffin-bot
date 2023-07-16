import type { SlashCommandType } from "../../../types";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Guild,
  InteractionResponse,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  TextInputStyle,
} from "discord.js";
import { prisma } from "../../../prisma/db";
import dayjs from "dayjs";
import { Movie } from "@prisma/client";

enum Actions {
  SEND = "send",
  CANCEL = "cancel",
  CHANGE_LAYOUT = "change_layout",
}

const command: SlashCommandType = {
  name: "movie_night",
  description: "Create a movie night!",
  ownerOnly: true,
  ephemeral: true,
  options: [
    {
      name: "end_after_hours",
      description:
        "Enter the number of hours after which the movie night vote ends (default: 24)",
      required: false,
      type: ApplicationCommandOptionType.Number,
      minValue: 1,
      maxValue: 24,
    },
  ],
  run: async ({ interaction }) => {
    const hours = (interaction.options.get("end_after_hours")?.value ??
      24) as number;

    const actionRow = await createMoviesSelect();

    const message = await interaction.followUp({
      content: "Select the movies you want to add to the vote",
      components: [actionRow],
    });

    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60000,
      componentType: ComponentType.SelectMenu,
    });

    collector.on("collect", async (i) => {
      collector.dispose(i);

      // const newActionRow = await createMoviesSelect(i.values, true);
      // await i.update({ components: [newActionRow] });

      await handleMovieNightCreate(i, hours);
    });
  },
};

const createMoviesSelect = async () => {
  const select = new StringSelectMenuBuilder()
    .setCustomId("movie")
    .setPlaceholder("Select a movie")
    .setMinValues(2)
    .setMaxValues(5);

  const movies = await prisma.movie.findMany({
    where: { is_watched: false },
    orderBy: { title: "asc" },
    take: 25,
  });

  const options = movies.map((movie) => {
    const { title, description } = movie;
    const id = movie.id.toString();

    return new StringSelectMenuOptionBuilder()
      .setLabel(title)
      .setValue(id)
      .setDescription(description);
  });

  select.addOptions(...options);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
};

const handleMovieNightCreate = async (
  interaction: StringSelectMenuInteraction,
  hours: number,
) => {
  const guild = (await interaction.guild) as Guild;

  const { values: moviesIDs } = interaction;

  const movies = await prisma.movie.findMany({
    where: { id: { in: moviesIDs } },
    orderBy: { title: "asc" },
  });

  const timeEnd = dayjs().add(hours, "hours").unix();

  const moviesStr = movies.map((i) => i.title);
  const embed = createMovieNightEmbed(guild, moviesStr, timeEnd);
  const moviesAction = createMoviesActionRow(movies);
  const modifyRow = createModifyActionRow();

  const response = await interaction.update({
    content: "This is a preview of the Movie Night!",
    embeds: [embed],
    components: [...moviesAction, modifyRow],
  });

  await handleButtonPress(response, interaction, {
    movies,
    timeEnd,
    guild,
    moviesStr,
  });
};

const handleButtonPress = async (
  response: InteractionResponse<boolean>,
  interaction: StringSelectMenuInteraction,
  constants: {
    movies: Movie[];
    timeEnd: number;
    guild: Guild;
    moviesStr: string[];
  },
) => {
  const collector = await response.createMessageComponentCollector({
    filter: (i) => interaction.user.id === i.user.id,
    time: 60_000,
    componentType: ComponentType.Button,
  });

  collector.on("collect", async (i) => {
    const { customId: buttonSelectedID } = i;
    const { movies, timeEnd, guild, moviesStr } = constants;

    switch (buttonSelectedID) {
      case Actions.SEND: {
        const embed = createMovieNightEmbed(guild, moviesStr, timeEnd);
        const moviesAction = createMoviesActionRow(movies);
      }
    }

    await i.followUp({
      content: "Button pressed!",
      ephemeral: true,
    });
  });
};

const createMovieNightEmbed = (
  guild: Guild,
  movies: string[],
  timeWhenVoteEnds: number,
) => {
  const descStart =
    "Here are three movies to choose from, for the next Movie Night. Vote for your movie!";
  const descToVote =
    "To vote, click on the button corresponding to the movie you want to vote for.";
  const descEnd =
    "The movie with the most votes will be played during the next Movie Night!";

  const movieList = movies
    .map((movie, index) => `\`${index + 1}. ${movie}\``)
    .join("\n");

  const endTimeFormatted = `<t:${timeWhenVoteEnds}:F>`;
  const endDesc = `Voting will end at ${endTimeFormatted}.`;

  const desc = `
  ${descStart}
  ${descToVote}
  ${descEnd}
  
  ${movieList}
  
  ${endDesc}
  `;

  const embed = new EmbedBuilder()
    .setTitle(`${guild.name} - Movie Night!`)
    .setImage(guild.iconURL({ size: 128 }))
    .setDescription(desc)
    .setTimestamp()
    .setColor("Random");

  return embed;
};

const createMoviesActionRow = (
  movies: Array<Movie>,
  type: "vertical" | "horizontal" = "horizontal",
) => {
  if (type === "horizontal") {
    const buttons = movies.map((movie) => {
      return new ButtonBuilder()
        .setCustomId(movie.id)
        .setLabel(movie.title)
        .setStyle(ButtonStyle.Primary);
    });

    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        ...buttons,
      );
    return [row];
  } else {
    return movies.map((movie) => {
      return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(movie.id)
          .setLabel(movie.title)
          .setStyle(ButtonStyle.Primary),
      );
    });
  }
};

const createModifyActionRow = () => {
  const sendButton = new ButtonBuilder()
    .setCustomId(Actions.SEND)
    .setLabel("Send")
    .setStyle(ButtonStyle.Success);

  const cancelButton = new ButtonBuilder()
    .setCustomId(Actions.CANCEL)
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Danger);

  const changeLayout = new ButtonBuilder()
    .setCustomId(Actions.CHANGE_LAYOUT)
    .setLabel("Change Layout")
    .setStyle(ButtonStyle.Secondary);

  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
    sendButton,
    cancelButton,
    changeLayout,
  );
};

export default command;

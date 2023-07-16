import type { SlashCommandType } from "../../../types";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  Message,
  MessageActionRowComponentBuilder,
  TextInputStyle,
} from "discord.js";
import { prisma } from "../../../prisma/db";
import { Prisma } from "@prisma/client";

const COUNT = 20;

const command: SlashCommandType = {
  name: "movies",
  description: "List all Movies",
  options: [
    {
      name: "show_unwatched",
      type: ApplicationCommandOptionType.Boolean,
      description: "Show unused movies",
      required: false,
    },
  ],
  run: async ({ interaction }) => {
    const showUnwatched = !!interaction.options.get("show_unwatched")?.value;

    const totalMoviesCount = await prisma.movie.count({
      where: { is_watched: !showUnwatched },
    });

    if (totalMoviesCount === 0) {
      await interaction.followUp({
        content: "No movies found!",
      });
      return;
    }

    const actionRow = createPaginationButtons(0, totalMoviesCount, COUNT);
    const movies = await getMovies(0, showUnwatched, COUNT);
    const embed = createEmbedWithPagination(
      0,
      totalMoviesCount,
      showUnwatched,
      movies,
      COUNT,
    );

    const response = await interaction.followUp({
      embeds: [embed],
      components: [actionRow],
    });

    await handlePageChange(response, interaction);
  },
};

const handlePageChange = async (
  message: Message<boolean>,
  interaction: CommandInteraction<CacheType>,
) => {
  const collector = message.createMessageComponentCollector({
    filter: (i) => interaction.user.id === i.user.id,
    time: 60_000,
    componentType: ComponentType.Button,
    idle: 10_000,
  });

  collector.on("collect", async (i) => {
    const { customId } = i;
    const [, page] = customId.split("_");
    const pageInt = +page;

    const showUnwatched = !!interaction.options.get("show_unwatched")?.value;
    const totalMoviesCount = await prisma.movie.count({
      where: { is_watched: !showUnwatched },
    });

    const actionRow = createPaginationButtons(pageInt, totalMoviesCount, COUNT);
    const movies = await getMovies(pageInt, showUnwatched, COUNT);
    const embed = createEmbedWithPagination(
      pageInt,
      totalMoviesCount,
      showUnwatched,
      movies,
      COUNT,
    );

    await i.update({ embeds: [embed], components: [actionRow] });
  });
};

const createPaginationButtons = (page: number, max: number, count = 10) => {
  const leftCount = page * count;
  const rightCount = (page + 1) * count;

  const leftDisabled = leftCount === 0;
  const rightDisabled = rightCount >= max;

  const leftButton = new ButtonBuilder()
    .setCustomId(`left_${page - 1}`)
    .setEmoji("898279635379449856")
    // .setLabel("⬅")
    .setDisabled(leftDisabled)
    .setStyle(ButtonStyle.Success);

  const rightButton = new ButtonBuilder()
    .setCustomId(`right_${page + 1}`)
    .setEmoji("898284896102015006")
    // .setLabel("➡")
    .setDisabled(rightDisabled)
    .setStyle(ButtonStyle.Success);

  const actionRow =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      leftButton,
      rightButton,
    );

  return actionRow;
};

const getMovies = async (page: number, showUnwatched: boolean, count = 10) => {
  const skip = page * count;

  return prisma.movie.findMany({
    where: { is_watched: !showUnwatched },
    skip,
    take: count,
    orderBy: { title: "asc" },
  }) as unknown as Promise<Array<Prisma.MovieSelect>>;
};

const formatMovies = (movies: Array<Prisma.MovieSelect>, page: number) => {
  const formatMovieToString = (movie: Prisma.MovieSelect, index: number) => {
    const count = index + 1 + page * 10;
    return `\`${count}.\` [${movie.title}](${movie.info_link})`;
  };

  return movies.map(formatMovieToString).join("\n");
};

const createEmbedWithPagination = (
  page: number,
  max: number,
  showUnwatched: boolean,
  movies: Array<Prisma.MovieSelect>,
  count = 10,
) => {
  const formattedList = formatMovies(movies, page);
  const title = showUnwatched
    ? `Watched Movies (${max})`
    : `Unwatched Movies (${max})`;
  const footer = `Page ${page + 1} of ${Math.ceil(max / count)}`;

  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(formattedList)
    .setFooter({ text: footer })
    .setColor("#51E1ED");
};

export default command;

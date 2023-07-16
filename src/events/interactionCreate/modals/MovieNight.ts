// import {
//   ActionRowBuilder,
//   ButtonBuilder,
//   ButtonStyle,
//   ComponentType,
//   EmbedBuilder,
//   Guild,
//   Message,
//   MessageActionRowComponentBuilder,
//   ModalSubmitInteraction,
// } from "discord.js";
// import dayjs from "dayjs";
//
// type Movie = { id: string; movieName: string };
//
// export const handleMovieNightModal = async (
//   interaction: ModalSubmitInteraction,
// ) => {
//   const guild = (await interaction.guild) as Guild;
//
//   const {
//     fields: { fields: modalFields },
//   } = interaction;
//   const getFieldsIterator = (_: any, index: number) => {
//     const id = `movie_${index + 1}`;
//     const field = modalFields.get(id)?.value;
//
//     if (!field) return;
//     return { id, movieName: field as string };
//   };
//
//   const fields = new Array(4)
//     .fill(null)
//     .map(getFieldsIterator)
//     .filter((i) => i) as Array<Movie>;
//
//   const hours = +(modalFields.get("hours")?.value as string);
//   const timeEnd = dayjs().add(hours, "hours").unix();
//
//   const moviesStr = fields.map((i) => i.movieName);
//   const embed = createMovieNightEmbed(guild, moviesStr, timeEnd);
//   const moviesAction = createMoviesActionRow(fields);
//   const modifyRow = createModifyActionRow();
//
//   const response = await interaction.followUp({
//     embeds: [embed],
//     components: [...moviesAction, modifyRow],
//   });
//
//   await handleButtonPress(response, interaction);
// };
//
// const handleButtonPress = async (
//   response: Message<boolean>,
//   interaction: ModalSubmitInteraction,
// ) => {
//   const collector = await response.createMessageComponentCollector({
//     filter: (i) => interaction.user.id === i.user.id,
//     time: 60_000,
//     componentType: ComponentType.Button,
//   });
//
//   collector.on("collect", async (i) => {
//     await i.reply("You have voted!");
//     console.log({ user: i.user.username, customId: i.customId });
//   });
// };
//
// const createMovieNightEmbed = (
//   guild: Guild,
//   movies: string[],
//   timeWhenVoteEnds: number,
// ) => {
//   const descStart =
//     "Here are three movies to choose from, for the next Movie Night. Vote for your movie!";
//   const descToVote =
//     "To vote, click on the button corresponding to the movie you want to vote for.";
//   const descEnd =
//     "The movie with the most votes will be played during the next Movie Night!";
//
//   const movieList = movies
//     .map((movie, index) => `\`${index + 1}. ${movie}\``)
//     .join("\n");
//
//   const endTimeFormatted = `<t:${timeWhenVoteEnds}:F>`;
//   const endDesc = `Voting will end at ${endTimeFormatted}.`;
//
//   const desc = `
//   ${descStart}
//   ${descToVote}
//   ${descEnd}
//
//   ${movieList}
//
//   ${endDesc}
//   `;
//
//   const embed = new EmbedBuilder()
//     .setTitle(`${guild.name} - Movie Night!`)
//     .setImage(guild.iconURL({ size: 128 }))
//     .setDescription(desc)
//     .setTimestamp()
//     .setColor("Random");
//
//   return embed;
// };
//
// const createMoviesActionRow = (
//   movies: Array<Movie>,
//   type: "vertical" | "horizontal" = "horizontal",
// ) => {
//   if (type === "horizontal") {
//     const buttons = movies.map((movie) => {
//       return new ButtonBuilder()
//         .setCustomId(movie.id)
//         .setLabel(movie.movieName)
//         .setStyle(ButtonStyle.Primary);
//     });
//
//     const row =
//       new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
//         ...buttons,
//       );
//     return [row];
//   } else {
//     return movies.map((movie) => {
//       return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
//         new ButtonBuilder()
//           .setCustomId(movie.id)
//           .setLabel(movie.movieName)
//           .setStyle(ButtonStyle.Primary),
//       );
//     });
//   }
// };
//
// const createModifyActionRow = () => {
//   const sendButton = new ButtonBuilder()
//     .setCustomId("send")
//     .setLabel("Send")
//     .setStyle(ButtonStyle.Success);
//
//   const cancelButton = new ButtonBuilder()
//     .setCustomId("cancel")
//     .setLabel("Cancel")
//     .setStyle(ButtonStyle.Danger);
//
//   const changeLayout = new ButtonBuilder()
//     .setCustomId("change_layout")
//     .setLabel("Change Layout")
//     .setStyle(ButtonStyle.Secondary);
//
//   return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
//     sendButton,
//     cancelButton,
//     changeLayout,
//   );
// };
//
// // const getServersCommonToUserAndBot = (
// //   client: ExtendedClient,
// //   interaction: ModalSubmitInteraction,
// // ) => {
// //   const userID = interaction.user.id;
// //   const commonGuilds = client.guilds.cache.filter((guild) =>
// //     guild.members.cache.has(userID),
// //   );
// //
// //   return commonGuilds.map((guild) => ({
// //     id: guild.id,
// //     name: guild.name,
// //   }));
// // };
//
// // const getGuild = async (interaction: ModalSubmitInteraction) => {
// //   if (interaction.inGuild()) {
// //     return interaction.guild;
// //   } else {
// //     const commonServers = getServersCommonToUserAndBot(client, interaction);
// //     const options = commonServers.map((server) =>
// //       new StringSelectMenuOptionBuilder()
// //         .setLabel(server.name)
// //         .setValue(server.id)
// //         .setDefault(server.id === commonServers[0].id),
// //     );
// //     const menu = new StringSelectMenuBuilder()
// //       .setCustomId("server")
// //       .setPlaceholder("Select a Server")
// //       .addOptions(...options);
// //
// //     const row =
// //       new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
// //         menu,
// //       );
// //
// //     return interaction.followUp({
// //       components: [row],
// //     });
// //   }
// // };

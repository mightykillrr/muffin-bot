import type { CommandInteraction } from "discord.js";
import { CommandInteractionOptionResolver } from "discord.js";
import type { Event, SlashCommandType } from "../types";
import { client } from "../main";
import { logger } from "../logger";

const event: Event<"interactionCreate"> = {
  event: "interactionCreate",
  run: async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!interaction.guildId) {
      await interaction.reply("This command can only be used in a server!");
      return;
    }

    const command = client.slashCommands.get(
      interaction.commandName,
    ) as SlashCommandType;
    if (!command) {
      await interaction.reply("This command does not exists!");
      return;
    }

    // let guild = await Guild.findOne({ guildID: interaction.guildId });
    // if (!guild) {
    //   guild = new Guild({ guildID: interaction.guildId });
    //   await guild.save();
    // }

    if (command.ownerOnly && !client.owners.includes(interaction.user.id)) {
      await interaction.reply({
        ephemeral: true,
        content: "This command can only be used by the bot owners!",
      });
      return;
    }
    try {
      await interaction.deferReply({ ephemeral: command.ephemeral || false });
      await command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as CommandInteraction,
        // guild,
      });
    } catch (e) {
      if (e instanceof Error) {
        logger.error(e.message);
        // sendErrorToOwners(interaction, e, client);
        console.log(e);
        // const errMessage = await interaction.followUp({
        //   embeds: [
        //     errorEmbedBuilder(
        //       "An error occurred while running the command. " +
        //         "Please try the command again at a later time. The devs have been notified.",
        //     ),
        //   ],
        // });
        // addAutoDeleteTimer(errMessage);
      } else {
        // const error = e as APIEmbed;
        // addAutoDeleteTimer(await interaction.followUp({ embeds: [error] }));
      }
    }
  },
};

export default event;

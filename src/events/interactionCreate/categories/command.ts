import { client } from "../../../main";
import { SlashCommandType } from "../../../types";
import type {
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { logger } from "../../../logger";

export const handleCommand = async (interaction: CommandInteraction) => {
  if (interaction.isCommand()) {
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

    if (command.consumeInstantly) {
      await command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client,
        interaction: interaction as CommandInteraction,
      });
      return;
    }

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
        await interaction.followUp(
          "An error occurred while running the command. " +
            "Please try the command again at a later time. The devs have been notified.",
        );
        // addAutoDeleteTimer(errMessage);
      } else {
        // const error = e as APIEmbed;
        // addAutoDeleteTimer(await interaction.followUp({ embeds: [error] }));
      }
    }
  }
};

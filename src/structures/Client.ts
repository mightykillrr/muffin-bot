import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import glob from "glob-promise";
import { Client, ClientEvents, Collection } from "discord.js";

import { logger } from "../logger";
import type { Event, SlashCommandType } from "../types";
import { Command } from "../types";

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Calcutta");

export class ExtendedClient extends Client {
  textCommands: Collection<string, Command> = new Collection();
  slashCommands: Collection<string, SlashCommandType> = new Collection();
  coolDowns: Collection<string, Collection<string, number>> = new Collection();
  owners = process.env.OWNERS?.split(",").map((owner) => owner.trim()) ?? [];

  constructor() {
    super({
      intents: 130863,
      allowedMentions: {
        repliedUser: false,
      },
      presence: {
        status: "idle",
        activities: [
          {
            name: "with myself",
            type: 0,
          },
        ],
      },
    });
  }

  async start() {
    try {
      await this._registerModules();
      await this.login(process.env.TOKEN);
    } catch (e) {
      const error = e as Error;
      logger.error({
        message: error.message,
        level: "error",
      });
    }
  }

  static async _importFile<T>(filePath: string) {
    const a = await import(filePath);
    return a?.default as T;
  }

  private async _registerSlashCommands(commands: Array<SlashCommandType>) {
    await this.application?.commands.set(commands);
  }

  private async _registerModules() {
    const start = process.hrtime();
    const slashCommands: Array<SlashCommandType> = [];
    const fileType = process.env.NODE_ENV === "development" ? "ts" : "js";

    const config = { root: require.main?.path };

    const [eventFiles, slashCommandFiles, textCommandFiles] = await Promise.all(
      [
        glob(`/events/*.${fileType}`, config),
        glob(`/commands/slash/*/index.${fileType}`, config),
        glob(`/commands/text/*/index.${fileType}`, config),
      ],
    );

    let textCommandCount = 0;
    const text = Promise.all(
      textCommandFiles.map(async (filePath) => {
        const command = await ExtendedClient._importFile<Command>(filePath);
        if (!command) return;
        this.textCommands.set(command.name, command);
        textCommandCount += 1;
      }),
    );

    let slashCommandCount = 0;
    const slash = Promise.all(
      slashCommandFiles.map(async (filePath) => {
        const command = await ExtendedClient._importFile<SlashCommandType>(
          filePath,
        );
        if (!command?.name) return;
        this.slashCommands.set(command.name, command);
        slashCommands.push(command);
        slashCommandCount += 1;
      }),
    );

    let eventCount = 0;
    const event = Promise.all(
      eventFiles.map(async (filePath) => {
        const events = await ExtendedClient._importFile<
          Event<keyof ClientEvents>
        >(filePath);
        const { event, run } = events;
        this.on(event, run);
        eventCount += 1;
      }),
    );

    await Promise.all([text, slash, event]);

    this.once("ready", async () => {
      await this._registerSlashCommands(slashCommands);
    });

    logger.info(`Registered ${textCommandCount} text commands.`);
    logger.info(`Registered ${slashCommandCount} slash commands.`);
    logger.info(`Registered ${eventCount} events.`);

    const end = process.hrtime(start);
    logger.success(
      `Loaded all modules in ${end[0]}.${Math.floor(end[1] / 1000000)}s`,
    );
  }
}

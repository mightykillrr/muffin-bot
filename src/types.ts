import {
  ChatInputApplicationCommandData,
  ClientEvents,
  type CommandInteraction,
  type CommandInteractionOptionResolver,
} from "discord.js";
import type { ExtendedClient } from "./structures/Client";

export interface Event<Key extends keyof ClientEvents> {
  event: Key;
  run: (...args: ClientEvents[Key]) => Promise<void>;
}

export interface Command {
  name: string;
  description: string;
  ownerOnly?: boolean;
  run: Function;
}

export interface SlashCommandRunArgs {
  client: ExtendedClient;
  interaction: CommandInteraction;
  args: CommandInteractionOptionResolver;
}

export type SlashCommandType = Command &
  ChatInputApplicationCommandData & {
    consumeInstantly?: boolean;
    ephemeral?: boolean;
    run: (interaction: SlashCommandRunArgs) => Promise<any>;
  };

export enum ModalTypes {
  MovieNight = "movie_night",
}

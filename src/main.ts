import "dotenv/config";
import { ExtendedClient } from "./structures/Client";
import { logger } from "./logger";

export const client = new ExtendedClient();

client.start().catch((e) => {
  const error = e as Error;
  logger.error(error.message);
  console.log(error);
});

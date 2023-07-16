import "dotenv/config";
import { ExtendedClient } from "./structures/Client";
import { logger } from "./logger";
import { prisma } from "./prisma/db";

export const client = new ExtendedClient();

client.start().catch(async (e) => {
  const error = e as Error;
  logger.error(error.message);
  await prisma.$disconnect();
  console.log(error);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  logger.info("Disconnected from database.");
  logger.info("Shutting down...");
  process.exit(0);
});

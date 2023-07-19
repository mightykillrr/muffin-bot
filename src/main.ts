import "dotenv/config";
import { ExtendedClient } from "./structures/Client";
import { logger } from "./logger";
import { prisma } from "./prisma/db";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Kolkata");

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

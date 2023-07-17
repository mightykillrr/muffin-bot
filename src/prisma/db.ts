import { PrismaClient } from "@prisma/client";
import { logger } from "../logger";

export const prisma = new PrismaClient();

prisma.$connect().then(async function () {
  logger.success("Connected to database.");
});

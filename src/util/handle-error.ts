import { logger } from "./logger";

export function handleError(err: unknown) {
  if (typeof err === "string") {
    logger.error(err);
    process.exit(1);
  }

  if (err instanceof Error) {
    logger.error(err.message);
    process.exit(1);
  }

  logger.error("Something went wrong. Pleas check your logger of terminal");
  process.exit(1);
}

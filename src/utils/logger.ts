type LogLevel = "debug" | "info" | "warn" | "error";

const PREFIX = "[Modellkatalog]";

/**
 * Lightweight logger for service worker and UI surfaces.
 * Avoids leaking sensitive payloads; only serializes known-safe fields.
 */
export const log = (
  level: LogLevel,
  message: string,
  details?: Record<string, unknown>,
): void => {
  const payload = details ? `${message} ${JSON.stringify(details)}` : message;
  const line = `${PREFIX} ${payload}`;

  switch (level) {
    case "debug":
      console.debug(line);
      break;
    case "info":
      console.info(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
  }
};

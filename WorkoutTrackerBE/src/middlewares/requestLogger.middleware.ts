import { randomUUID } from "crypto";
import pinoHttp from "pino-http";
import { logger } from "../config/logger";

/**
 * Attaches a request id (honouring an inbound `x-request-id`) and emits one
 * structured log line per request. `req.log` is a child logger carrying the id,
 * so anything logged downstream can be correlated.
 */
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const inbound = req.headers["x-request-id"];
    const id = (Array.isArray(inbound) ? inbound[0] : inbound) || randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  autoLogging: {
    ignore: (req) => req.url === "/health/live" || req.url === "/health/ready",
  },
});

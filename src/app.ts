import express from "express";
import helmet from "helmet";
import cors from "cors";
import { json, urlencoded } from "express";
import { configureLogger } from "./config/logger.js";
import { registerRoutes } from "./routes/index.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { responseFormatter } from "./middlewares/responseFormatter.js";

export const createApp = () => {
  const app = express();
  const logger = configureLogger();

  app.set("logger", logger);

  app.use(helmet());
  app.use(cors());
  app.use(requestLogger(logger));
  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true }));
  app.use(responseFormatter());

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler(logger));

  return app;
};

import { buildServer } from "./app";
import { serverConfig } from "./config";

const start = async () => {
  const app = await buildServer();

  const closeGracefully = async (signal: NodeJS.Signals) => {
    app.log.info({ signal }, "Graceful shutdown started");
    try {
      await app.close();
      app.log.info("HTTP server closed");
      process.exit(0);
    } catch (error) {
      app.log.error({ err: error }, "Failed during graceful shutdown");
      process.exit(1);
    }
  };

  process.once("SIGINT", () => void closeGracefully("SIGINT"));
  process.once("SIGTERM", () => void closeGracefully("SIGTERM"));

  try {
    await app.listen({
      host: serverConfig.host,
      port: serverConfig.port,
      backlog: 4096,
    });

    app.log.info(
      { host: serverConfig.host, port: serverConfig.port },
      "Backend server is running",
    );
  } catch (error) {
    app.log.error({ err: error }, "Failed to start backend server");
    process.exit(1);
  }
};

void start();

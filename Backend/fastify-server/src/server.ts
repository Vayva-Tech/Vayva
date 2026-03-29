import { buildServer } from "./index";

const start = async () => {
  try {
    const server = await buildServer();

    const port = parseInt(process.env.PORT || "4000", 10);
    const host = process.env.HOST || "0.0.0.0";

    await server.listen({ port, host });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

start();

/**
 * Workflow Service Entry Point
 */

import { createServer } from './server.js';
import { config } from './config/env.js';

async function main() {
  const app = createServer();

  app.listen(config.port, () => {
    console.warn(`Workflow service running on port ${config.port}`);
    console.warn(`Environment: ${config.nodeEnv}`);
  });
}

main().catch((error) => {
  console.error('Failed to start workflow service:', error);
  process.exit(1);
});

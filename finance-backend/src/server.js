import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { createApp } from './app.js';

async function main() {
  await connectDatabase();
  const { httpServer } = await createApp();

  const listenHost = env.nodeEnv === 'production' ? '0.0.0.0' : '127.0.0.1';

  await new Promise((resolve) => {
    httpServer.listen(env.port, listenHost, () => {
      console.log(`Server listening on ${listenHost}:${env.port}`);
      console.log(`REST base: http://localhost:${env.port}/api/v1`);
      console.log(`GraphQL:   http://localhost:${env.port}/graphql`);
      resolve();
    });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

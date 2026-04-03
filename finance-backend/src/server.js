import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { createApp, startGraphQLAndFallbacks } from './app.js';

async function main() {
  const { app, httpServer, apollo } = createApp();

  // Render/Docker/Fly must bind 0.0.0.0 — 127.0.0.1 hides the port from the platform's scan → "no open ports"
  const listenHost = '0.0.0.0';

  await new Promise((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(env.port, listenHost, () => {
      httpServer.off('error', reject);
      console.log(
        `Server listening on ${listenHost}:${env.port} (process.env.PORT=${process.env.PORT ?? 'unset'})`
      );
      console.log(`REST base: http://localhost:${env.port}/api/v1`);
      console.log(`GraphQL:   http://localhost:${env.port}/graphql`);
      resolve();
    });
  });

  await Promise.all([
    startGraphQLAndFallbacks(app, apollo),
    connectDatabase().catch((err) =>
        console.error(
          'MongoDB connection failed — fix Atlas / MONGODB_URI; /health still works:',
          err.message
        )
      ),
  ]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

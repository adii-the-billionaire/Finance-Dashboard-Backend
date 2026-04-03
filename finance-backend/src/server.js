import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { createApp, startGraphQLAndFallbacks } from './app.js';

async function main() {
  const { app, httpServer, apollo } = createApp();

  const listenHost = env.nodeEnv === 'production' ? '0.0.0.0' : '127.0.0.1';

  await new Promise((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(env.port, listenHost, () => {
      httpServer.off('error', reject);
      console.log(`Server listening on ${listenHost}:${env.port}`);
      console.log(`REST base: http://localhost:${env.port}/api/v1`);
      console.log(`GraphQL:   http://localhost:${env.port}/graphql`);
      resolve();
    });
  });

  await Promise.all([
    startGraphQLAndFallbacks(app, apollo),
    connectDatabase()
      .then(() => console.log('MongoDB connected'))
      .catch((err) =>
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

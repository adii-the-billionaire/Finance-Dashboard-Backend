import express from 'express';
import cors from 'cors';
import http from 'http';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
import { createGraphQLContext } from './graphql/context.js';
import { ZodError } from 'zod';
import { AppError } from './errors/AppError.js';
import mongoose from 'mongoose';
import { env } from './config/env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const openApiSpec = JSON.parse(
  readFileSync(join(__dirname, 'docs', 'openapi.json'), 'utf8')
);

export async function createApp() {
  const app = express();
  const httpServer = http.createServer(app);

  if (env.nodeEnv === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.json({
      ok: true,
      database: dbConnected ? 'connected' : 'disconnected',
    });
  });

  app.get('/', (_req, res) => {
    res.json({
      name: 'Finance Dashboard API',
      endpoints: {
        health: '/health',
        apiDocs: '/api-docs',
        openApiJson: '/openapi.json',
        restBase: '/api/v1',
        graphql: '/graphql',
      },
    });
  });

  // swaggerUi.serve is an array of middleware — must be spread for Express
  app.use(
    '/api-docs',
    ...swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customSiteTitle: 'Finance Dashboard API',
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );
  app.get('/openapi.json', (_req, res) => {
    res.json(openApiSpec);
  });

  app.use('/api/v1', apiRoutes);

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (formattedError) => {
      const orig = formattedError.originalError;
      if (orig instanceof AppError) {
        return {
          message: orig.message,
          extensions: { code: 'APP_ERROR', statusCode: orig.statusCode },
        };
      }
      if (orig instanceof ZodError) {
        return {
          message: 'Validation failed',
          extensions: { code: 'BAD_USER_INPUT', issues: orig.issues },
        };
      }
      return formattedError;
    },
  });

  await apollo.start();
  app.use(
    '/graphql',
    expressMiddleware(apollo, {
      context: async ({ req }) => createGraphQLContext({ req }),
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, httpServer };
}

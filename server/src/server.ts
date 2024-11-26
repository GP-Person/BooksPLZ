import { fileURLToPath } from 'url';
import path from 'path';
import express from 'express';
import type { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { authenticateToken } from './services/auth-service.js';
import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';

// Workaround for ES modules (__dirname and __filename)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

const startApolloServer = async () => {
  try {
    // Start Apollo Server
    await server.start();
    console.log('Apollo Server started successfully.');

    // Wait for DB connection
    await db;
    console.log('Database connected successfully.');

    // Middleware setup
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(
      '/graphql',
      expressMiddleware(server as any, {
        context: authenticateToken as any,
      })
    );

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      const clientBuildPath = path.join(__dirname, '../client/dist');
      app.use(express.static(clientBuildPath));

      // Fallback to index.html for unknown routes
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(clientBuildPath, 'index.html'));
      });
    }

    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API server running on http://0.0.0.0:${PORT}!`);
      console.log(`GraphQL available at http://0.0.0.0:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

// Start the Apollo server
startApolloServer();

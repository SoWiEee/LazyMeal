import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import prismaPlugin from './plugins/prismaPlugin.js';
import restaurantRoutes from './routes/restaurant.js';
import watchlistRoutes from './routes/watchlist.js';

const fastify = Fastify({
	logger: {
		level: 'debug',
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
				ignore: 'pid,hostname'
			}
		}
	}
});

// CORS
fastify.register(cors, {
  	origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  	allowedHeaders: ['Content-Type', 'Authorization'],
  	credentials: true,
});

fastify.register(prismaPlugin);

fastify.register(restaurantRoutes, { prefix: '/api/restaurants' });
fastify.register(watchlistRoutes, { prefix: '/api/watchlist' });

const start = async () => {
	try {
		const port = process.env.PORT || 3000;
		const host = process.env.HOST || '0.0.0.0';

		// start server
		await fastify.listen({ port, host });
		fastify.log.info(`Server listening on ${host}:${port}`);

	} catch (err) {
		fastify.log.error('Failed to start server:', err);
		process.exit(1);
	}
};

start();
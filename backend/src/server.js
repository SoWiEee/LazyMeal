import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import restaurantRoutes from './routes/restaurant.js';

dotenv.config();
const prisma = new PrismaClient();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
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
  	origin: process.env.CORS_ORIGIN || '*',
  	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  	allowedHeaders: ['Content-Type', 'Authorization'],
  	credentials: true,
});

fastify.decorate('prisma', prisma);

fastify.addHook('onClose', async (instance) => {
	await instance.prisma.$disconnect();
	instance.log.info('[V] Prisma disconnected.');
});

// register restaurant routes
fastify.register(restaurantRoutes, { prefix: '/api/restaurants' });

const start = async () => {
	try {
		const port = process.env.PORT || 3000;
		const host = process.env.HOST || '0.0.0.0';

		// connect to database
		await prisma.$connect();
		fastify.log.info('Connected to PostgreSQL database.');

		// start server
		await fastify.listen({ port, host });
		fastify.log.info(`Server listening on ${host}:${port}`);

	} catch (err) {
		fastify.log.error('Failed to start server:', err);
		process.exit(1);
	}
};

start();
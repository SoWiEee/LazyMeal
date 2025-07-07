import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

async function prismaPlugin(fastify, options) {
    const prisma = new PrismaClient();

    fastify.decorate('prisma', prisma);

    fastify.addHook('onClose', async (instance) => {
        await instance.prisma.$disconnect();
        instance.log.info('Prisma disconnected.');
    });

    fastify.addHook('onReady', async () => {
        try {
            await prisma.$connect();
            fastify.log.info('[V]Connected to PostgreSQL database.');
        } catch (error) {
            fastify.log.error('[X] Failed to connect to PostgreSQL:', error);
            fastify.close();
        }
    });
}

export default fp(prismaPlugin);
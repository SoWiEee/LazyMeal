import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

async function prismaPlugin(fastify, options) {
    const prisma = new PrismaClient();

    await prisma.$connect();
    fastify.log.info('[V] Connected to PostgreSQL database.');

    fastify.decorate('prisma', prisma);

    fastify.addHook('onRequest', (request, reply, done) => {
        request.prisma = prisma;
        done();
    });
    
    fastify.addHook('onClose', async (instance) => {
        if (instance.prisma && typeof instance.prisma.$disconnect === 'function') {
            await instance.prisma.$disconnect();
            instance.log.info('[V] Disconnected from PostgreSQL database via Prisma.');
        }
    });
}

export default fp(prismaPlugin);
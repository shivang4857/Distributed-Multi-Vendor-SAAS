import { PrismaClient } from "@prisma/client";

declare global {
    namespace globalThis {
        var prismadb : PrismaClient | undefined;
    }
}

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production") global.prismadb = prisma;
//prevents “too many connections” and improves stability in dev.

export default prisma;
import {PrismaMariaDb} from "@prisma/adapter-mariadb"
import {PrismaClient} from "../generated/prisma/client.ts"
import env from "../config/env.js"

const adapter = new PrismaMariaDb({
    host: env.DATABASE.HOST,
    user: env.DATABASE.USERNAME,
    password: env.DATABASE.PASSWORD,
    database: env.DATABASE.NAME,
    connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter })

export {prisma}
import "dotenv/config";

const env = {
    PORT : process.env.PORT,
    DATABASE : {
        HOST:process.env.DATABASE_HOST,
        URL: process.env.DATABASE_URL,
        NAME: process.env.DATABASE_NAME,
        USERNAME: process.env.DATABASE_USER,
        PASSWORD: process.env.DATABASE_PASSWORD,
        PORT: process.env.DATABASE_PORT
    }
}

export default env
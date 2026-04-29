import "dotenv/config";

const env = {
    PORT : process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    DATABASE : {
        HOST:process.env.DATABASE_HOST,
        URL: process.env.DATABASE_URL,
        NAME: process.env.DATABASE_NAME,
        USERNAME: process.env.DATABASE_USER,
        PASSWORD: process.env.DATABASE_PASSWORD,
        PORT: process.env.DATABASE_PORT
    },
    AUTH: {
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
        JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    }
}

export default env

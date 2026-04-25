import express from "express"
import router from "./routes/index.js"
import cors from "cors"
import env from "./config/env.js"

const app = express()

const allowedOrigins = (env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
}))
app.use(express.json({limit: "25mb"}))
app.use(router)

export default app

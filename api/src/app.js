import express from "express"
import router from "./routes/index.js"
import cors from "cors"
import env from "./config/env.js"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDirectory = path.resolve(__dirname, "../uploads")

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
app.use("/uploads", express.static(uploadsDirectory))
app.use(router)
app.use((err, _, res, __) => {
    if (err?.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            message: "File size exceeds 2MB limit"
        })
    }

    if (err?.statusCode) {
        return res.status(err.statusCode).json({
            message: err.message
        })
    }

    return res.status(500).json({
        message: "Internal server error"
    })
})

export default app

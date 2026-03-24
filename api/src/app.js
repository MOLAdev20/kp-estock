import express from "express"
import router from "./routes/index.js"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json({limit: "25mb"}))
app.use(router)

export default app
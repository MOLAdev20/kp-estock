import express from "express"
import router from "./routes/index.js"

const app = express()

app.use(express.json({limit: "25mb"}))
app.use(router)

export default app
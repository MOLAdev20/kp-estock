import { Router } from "express"
import transactionController from "../controllers/transaction.controller.js"

const route = Router()

route.get("/", transactionController.getAll)
route.get("/:id", transactionController.getById)
route.post("/", transactionController.create)

export default route

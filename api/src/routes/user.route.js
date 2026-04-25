import { Router } from "express"
import userController from "../controllers/user.controller.js"

const route = Router()

route.post("/", userController.login)
route.post("/refresh", userController.refreshAccessToken)
route.post("/logout", userController.logout)

export default route

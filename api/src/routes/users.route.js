import { Router } from "express";
import usersController from "../controllers/users.controller.js";

const route = Router();

route.get("/", usersController.getAll);
route.post("/", usersController.createOne);
route.put("/:id", usersController.updateOne);
route.patch("/:id/password", usersController.changePassword);

export default route;

import { Router } from "express";
import stockManagementController from "../controllers/stock_management.controller.js";

const route = Router();

route.get("/", stockManagementController.getAll);
route.patch("/:uuid", stockManagementController.updateOne);

export default route;

import { Router } from "express";
import dashboardController from "../controllers/dashboard.controller.js";

const route = Router();

route.get("/", dashboardController.getOverview);

export default route;

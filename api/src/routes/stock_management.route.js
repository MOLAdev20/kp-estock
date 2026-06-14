import { Router } from "express";
import stockManagementController from "../controllers/stock_management.controller.js";

const route = Router();

route.get("/", stockManagementController.getAll);
route.get("/:uuid/audit-trails", stockManagementController.getAuditTrails);
route.post("/:uuid/adjustments", stockManagementController.adjustStock);
route.get("/:uuid", stockManagementController.getOne);
route.patch("/:uuid", stockManagementController.updateOne);

export default route;

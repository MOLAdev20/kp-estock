import { Router } from "express";
import suppliersController from "../controllers/suppliers.controller.js";

const route = Router();

route.get("/", suppliersController.getAll);
route.get("/:id", suppliersController.getOne);
route.post("/", suppliersController.createOne);
route.put("/:id", suppliersController.updateOne);
route.delete("/:id", suppliersController.deleteOne);

export default route;

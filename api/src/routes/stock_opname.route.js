import { Router } from "express";
import stockOpnameController from "../controllers/stock_opname.controller.js";

const route = Router();

route.get("/racks", stockOpnameController.getRacks);
route.get("/products", stockOpnameController.getProductsByRack);
route.get("/", stockOpnameController.getAll);
route.post("/", stockOpnameController.create);
route.get("/:id", stockOpnameController.getOne);

export default route;

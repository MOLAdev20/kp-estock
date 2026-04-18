import { Router } from "express";
import productController from "../controllers/product.controller.js";

const route = Router();

route.get("/", productController.getAll)
route.get("/check-sku/:sku", productController.validateSku)
route.post("/new", productController.createOne)
route.delete("/delete/:uuid", productController.deleteOne)

export default route
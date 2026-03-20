import { Router } from "express";
import productController from "../controllers/product.controller.js";

const route = Router();

route.get("/", productController.getAll)
route.post("/new", productController.createOne)

export default route
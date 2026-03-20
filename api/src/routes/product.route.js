import { Router } from "express";
import productController from "../controller/product.controller.js";

const route = Router();

route.get("/", productController.getAll)

export default route
import { Router } from "express";
import product from "./product.route.js";

const route = Router()

route.use("/product", product);

export default route;
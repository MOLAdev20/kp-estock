import { Router } from "express";
import product from "./product.route.js";
import user from "./user.route.js";
import authorization from "../middlewares/authorization.middleware.js";

const route = Router()

route.use("/product", authorization, product);
route.use("/auth", user);

export default route;

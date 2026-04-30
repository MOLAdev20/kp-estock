import { Router } from "express";
import product from "./product.route.js";
import user from "./user.route.js";
import transaction from "./transaction.route.js";
import stockManagement from "./stock_management.route.js";
import dashboard from "./dashboard.route.js";
import authorization from "../middlewares/authorization.middleware.js";

const route = Router()

route.use("/product", authorization, product);
route.use("/transaction", authorization, transaction);
route.use("/stock-management", authorization, stockManagement);
route.use("/dashboard", authorization, dashboard);
route.use("/auth", user);

export default route;

import { Router } from "express";
import { __dirname, authorization, passportCall } from "../utils.js";
import { productsViewController } from "../controllers/views.controller.js";

const router = Router();

router.get(
  "/",
  passportCall("jwt"),
  productsViewController 
);

router.get("/realtimeproducts", passportCall("jwt"), authorization("Admin"), (req, res) => {
  res.render("realtimeproducts.hbs", {
    title: "Ingresar productos",
    fileCss: "styles.css",
  });
});

router.get("/chat",passportCall("jwt"), authorization("User"), (req, res) => {
  res.render("chat.hbs", {
    title: "Chat",
    fileCss: "styles.css",
  });
});

export default router;

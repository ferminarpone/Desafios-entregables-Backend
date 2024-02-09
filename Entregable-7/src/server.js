import express from "express";
import mongoose from "mongoose";
import handlebars from "express-handlebars";
import { __dirname } from "./utils.js";
import Handlebars from "handlebars";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import viewsRouter from "./routes/views.routes.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import { initSocketServer } from "./services/socket.js";
import usersViewRouter from "./routes/user.views.router.js";

import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cookieParser from 'cookie-parser'
import githubLoginViewRouter from "./routes/github-login.views.router.js";
import jwtRouter from "./routes/jwt.router.js";
import config from "./config/config.js";
//import program from "./process.js";

//VER PROBLEMA con el port
//const PORT=config.port;
const MONGO_URL = config.mongo_url;

const app = express();
const httpServer = app.listen(config.port, () =>
  console.log(`Server listening on port ${config.port}`)
);
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuraciób web socket
initSocketServer(httpServer);

// Configuración mongoose
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Data base connected"))
  .catch((e) => {
    console.log("Data base connection error");
    console.log(e);
  });


//Configuración de passport
initializePassport();
app.use(passport.initialize());

//Cookies
app.use(cookieParser("EcommerceS3cr3tC0d3"));

// Configuración engine
app.engine(
  "hbs",
  handlebars.engine({
    extname: "hbs",
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
// Seteando motor de plantillas
app.set("view engine", "hbs");
app.set("views", `${__dirname}/views`);

// Public
app.use(express.static(`${__dirname}/../public`));

// Routes de productos y carritos
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/products", viewsRouter);

//Routes de usuarios
//JWT
app.use("/api/jwt", jwtRouter);
app.use('/', usersViewRouter);
//Routes login gitHub
app.use("/github", githubLoginViewRouter);
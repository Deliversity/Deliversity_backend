import express, { Response, NextFunction } from "express";
import createError from "http-errors";
import logger from "morgan";
import * as bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import { auth } from "./router/auth";
import { test } from "./router/test";
import {passportConfig} from './config/passport';
import * as util from "./config/util";
import { db } from "./models";

import dotenv from "dotenv";
dotenv.config();

// authenticate -> Open connection
// sync -> make table if not exist
db
  //.sync() //make table if not exist
  .authenticate() //Open connection
  .then(() => console.log("DB connected."))
  .catch(() => {
    throw "error";
  });

const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize()); // passport 구동
passportConfig();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "content-type, x-access-token");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  next();
});

app.use("/api/v1/auth", auth);
app.use("/api/v1/test", test);
app.use(cors());

app.use(function (req: any, res: Response, next: NextFunction) {
  next(createError(404));
});

app.use(function(err:any, req:any, res:Response, next:NextFunction) {
  // error 템플릿에 전달할 데이터 설정
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json(util.successFalse(null,"Error",null));
});

app.listen(process.env.WEB_PORT, () => {
  console.log("Server Started");
});

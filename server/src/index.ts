import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { userRouter } from "./routes/user";
import { productRouter } from "./routes/product";
const app = express();

app.use(express.json());
app.use(cors(
  {
    origin:["https://shop-ease.vercel.app"],
    methods:["POST","GET"],
    credentials:true
  }
));

app.use("/user",userRouter);
app.use("/product",productRouter);

mongoose.connect(
  "mongodb+srv://akshatdehru:mongodb123@ecommerce.0cmbe3f.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce"
);

app.listen(3001, () => console.log("Server started"));     
 

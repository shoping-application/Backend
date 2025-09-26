const express=require("express")
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

const userRoutes=require("./routes/userRoutes")
const addressRoutes=require("./routes/addressRoutes")
const productRoutes=require("./routes/productRoutes")
const userCartRoutes=require("./routes/userCartRoutes")

app.use(
  cors({
    origin: "https://swiftmartshopping.netlify.app",
    credentials: true,
  })
);
app.use(express.json());

const PORT=8080

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

app.use("/api/user", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/products", productRoutes);
app.use("/api/userCart", userCartRoutes);

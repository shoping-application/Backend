const express = require("express");
const middleware =require("../middleware/middleware")
const router = express.Router();

const {createProduct , getProduct, updateProduct, createOrder,verifyPayment}=require("../service/productService")

router.post("/create-product",middleware,createProduct)
router.get("/get-product/:catagory",getProduct)
router.post("/update-product/:id",updateProduct)
router.post("/create-order",createOrder)
router.post("/verify-payment", verifyPayment);

router.get("/get-product/:catagory",getProduct)

module.exports=router
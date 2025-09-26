const express = require("express");
const router = express.Router();
const {
  addToCart,
  getUserCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
  getAllOrders,
  getAllOrdersInAdmin,
  updateOrderStatus
} = require("../service/userCartService");

const middleware=require("../middleware/middleware")

router.post("/add-to-cart",middleware, addToCart);             
router.get("/get-cart",middleware, getUserCart);    
router.put("/:id", updateCartItem);       
router.delete("/clear",middleware, clearCart); 
router.delete("/:id", deleteCartItem);   
router.get("/get-all-order",middleware,getAllOrders)


router.get("/get-all-order-in-admin",getAllOrdersInAdmin)
router.put("/update-status/:orderId",updateOrderStatus)

module.exports = router;
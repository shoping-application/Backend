const express = require("express");
const { signup, login, forgotPassword, resetPassword, getUserDetail,updateUserDetail } = require("../service/userService");
const middleware =require("../middleware/middleware")
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);   
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword); 
router.get("/user-detail",middleware, getUserDetail); 
router.post("/user-detail",middleware, updateUserDetail); 



module.exports = router;

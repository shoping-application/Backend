const express = require("express");
const middleware =require("../middleware/middleware")
const router = express.Router();

const {createAddress, getAddress, deleteAddress, setDefaultAddress, updateAddress}=require("../service/addressService")

router.post("/create-address",middleware,createAddress)
router.get("/get-addresses",middleware,getAddress)
router.delete("/delete-addresses/:id",middleware,deleteAddress)
router.put("/set-default/:id",middleware,setDefaultAddress)
router.put("/update-address/:id",middleware,updateAddress)


module.exports=router
const UserCart = require("../models/userCart");
const Order = require("../models/order");
const { v4: uuidv4 } = require("uuid");

const addToCart = async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const user = req.userId;

    const cartItem = new UserCart({ user, product, quantity });
    await cartItem.save();

    res.status(201).json({ success: true, data: cartItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserCart = async (req, res) => {
  try {
    const user = req.userId;

    const cartItems = await UserCart.find({ user: user })
      .populate("product")
      .populate("user");

    res.json({ success: true, data: cartItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const updatedCart = await UserCart.findByIdAndUpdate(
      id,
      { quantity },
      { new: true }
    ).populate("product");

    if (!updatedCart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    res.json({ success: true, data: updatedCart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCartItem = await UserCart.findByIdAndDelete(id);

    if (!deletedCartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cartItems = await UserCart.find({ user: userId });

    if (!cartItems.length) {
      return res
        .status(200)
        .json({ success: false, message: "Cart is already empty" });
    }


    const orderId = `SPDY${uuidv4().slice(0,8)}`;

    const orderDocs = cartItems.map((item) => ({
      user: userId,
      product: item.product,
      quantity: item.quantity,
      orderId,   
    }));


    await Order.insertMany(orderDocs);

    await UserCart.deleteMany({ user: userId });

    res.json({ success: true, message: "All cart items cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const user = req.userId;

    const cartItems = await Order.find({ user: user })
      .populate("product")
      .populate("user");

    return res.status(200).json({ success: true, data: cartItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const getAllOrdersInAdmin = async (req, res) => {
  try {
    const cartItems = await Order.find()
      .populate("product")
      .populate("user");

    return res.status(200).json({ success: true, data: cartItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params; // order _id from URL
    const { status } = req.body;

    // validate allowed statuses
    const allowedStatuses = ["pending", "out_for_delivery", "delivered", "canceled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

     const result = await Order.updateMany(
      { orderId },
      { $set: { status } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order status updated", result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


module.exports = {
  addToCart,
  getUserCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
  getAllOrders,
  getAllOrdersInAdmin,
  updateOrderStatus
};

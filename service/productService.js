// routes/productRoutes.js
const express = require("express");
const Product = require("../models/product"); // adjust path if needed
const Razorpay = require("razorpay");

const crypto = require("crypto");

const dotenv =require("dotenv")

dotenv.config();

// POST /api/products - create a new product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      weight,
      images,
      status,
      salesCount,
      ratings,
      organic,
    } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      brand,
      organic: organic || false,
      weight: weight
        ? {
            value: weight.value,
            unit: weight.unit || "g",
          }
        : undefined,
      images: Array.isArray(images) ? images : [],
      status: status || "draft",
      salesCount: salesCount || 0,
      ratings: ratings || {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
    });

    const savedProduct = await newProduct.save();

    return res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const category = req.params.catagory;
    let products;
    if (category && category !== "undefined") {
      products = await Product.find({ category });
    } else {
      products = await Product.find();
    }

    if (!products.length) {
      return res.status(200).json({ message: "No products found" });
    }

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      brand,
      weight,
      images,
      status,
      salesCount,
      ratings,
      organic,
    } = req.body;

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update only provided fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (organic !== undefined) product.organic = organic;

    if (weight !== undefined) {
      product.weight = {
        value: weight.value,
        unit: weight.unit || "g",
      };
    }

    if (images !== undefined) {
      product.images = Array.isArray(images) ? images : [];
    }

    if (status !== undefined) product.status = status;
    if (salesCount !== undefined) product.salesCount = salesCount;

    if (ratings !== undefined) {
      product.ratings = {
        average: ratings.average || product.ratings.average,
        count: ratings.count || product.ratings.count,
        distribution: ratings.distribution || product.ratings.distribution,
      };
    }

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const createOrder = async (req, res) => {
  const { amount } = req.body; // Amount in INR
  const options = {
    amount: amount,
    currency: "INR",
    receipt: "Order Receipt",
  };

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const order = await razorpay.orders.create(options);
    return res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).send(error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    // Create signature with secret
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const query = req.query.query?.trim();

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await Product.find({
      name: { $regex: query, $options: "i" },
      status: "active", 
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Server error while searching products" });
  }
}

module.exports = { createProduct,searchProducts, getProduct, updateProduct, createOrder, verifyPayment };

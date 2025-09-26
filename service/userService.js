const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { sendEmail } = require("../config/mail");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv")

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== LOGIN =====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== Forgot PASSWORD =====================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }
    // 2. Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const Frontend_Url =process.env.Frontend_Url

   const resetURL = `${Frontend_Url}/reseat-password?token=${resetToken}`;

    await sendEmail(
      email,
      "Password Reset",
      `
    <p>You requested a password reset</p>
    <p>Click this link to reset your password (valid for 10 minutes):</p>
    <a href="${resetURL}">${resetURL}</a>
  `
    );

    res
      .status(200)
      .json({ success: true, message: "Reset link sent to email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== RESET PASSWORD =====================
const resetPassword = async (req, res) => {
  try {
    const { newPassword,token } = req.body;

    // 1. Find user by token and check expiry
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }, // token not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Save new password & clear token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const id = req.userId;

    if (!id) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get User Detail Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateUserDetail = async (req, res) => {
  try {
    const { fullName, phoneNumber, dateOfBirth } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update fields if provided
    if (fullName) user.name = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Details updated", user });
  } catch (error) {
    console.error("Update User Detail Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getUserDetail,
  updateUserDetail,
};

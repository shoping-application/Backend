const Address = require("../models/address");
const User = require("../models/user");

const createAddress = async (req, res) => {
  try {
    const {
      addressLabel,
      streetAdress,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = req.body;

    const userId = req.userId;

    if (
      !addressLabel ||
      !streetAdress ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return res
        .status(404)
        .json({ sucess: false, message: "Required fields are missing" });
    }
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ sucess: false, message: "user not found" });
    }

    if (isDefault) {
      await Address.updateMany(
        { user: userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const newAddress = new Address({
      user: userId,
      addressLabel,
      streetAdress,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false,
    });

    await newAddress.save();

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: newAddress,
    });
  } catch (error) {
    console.error("Get User Detail Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAddress = async (req, res) => {
  try {
    const userId = req.userId;

    const address = await Address.find({ user: userId });

    return res
      .status(200)
      .json({ success: true, message: "data fetched", address });
  } catch (error) {
    console.error("Get User Detail Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findById(id);

    if (!address) {
      return res
        .status(404)
        .json({ success: true, message: "address not found" });
    }

    await Address.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete Address Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const {
      addressLabel,
      streetAdress,
      city,
      state,
      postalCode,
      country,
      isDefault,
      isActive
    } = req.body;

    const userId = req.userId;

    const address = await Address.findById(addressId);

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    if (address.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this address" });
    }

    // If the address is set as default, unset all other addresses
    if (isDefault) {
      await Address.updateMany(
        { user: userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    // Update the address fields
    address.addressLabel = addressLabel ?? address.addressLabel;
    address.streetAdress = streetAdress ?? address.streetAdress;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.postalCode = postalCode ?? address.postalCode;
    address.country = country ?? address.country;
    address.isDefault = isDefault ?? address.isDefault;
    if (isActive !== undefined) {
      address.isActive = isActive;
    }

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });

  } catch (error) {
    console.error("Update Address Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params; 
    const userId = req.userId; 

    const address = await Address.findOne({
      _id: id,
      user: userId,
      isActive: true,
    });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    await Address.updateMany(
      { user: userId, _id: { $ne: id } },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;
    await address.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("Set Default Address Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
module.exports = { createAddress, getAddress, updateAddress, deleteAddress, setDefaultAddress };

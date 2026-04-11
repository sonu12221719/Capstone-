import path from "path";
import User from "../models/User.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken -googleId",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Unable to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
      },
      { new: true, runValidators: true },
    ).select("-password -refreshToken -googleId");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(updatedUser);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Unable to update profile" });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile photo is required." });
    }

    const filename = path.basename(req.file.path);
    const profilePic = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic },
      { new: true, runValidators: true },
    ).select("-password -refreshToken -googleId");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(updatedUser);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Unable to upload profile photo" });
  }
};

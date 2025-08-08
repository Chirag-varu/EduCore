import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { RefreshToken } from "../models/refreshToken.js";

export const generateTokens = async(user) => {
  // Generate the access token (short-lived)
  const accessToken = jwt.sign(
    { userId: user._id }, 
    process.env.SECRET_KEY, 
    { expiresIn: '60m' }
  );

  // Generate the refresh token as a JWT (long-lived)
  const refreshToken = jwt.sign(
    { userId: user._id }, 
    process.env.SECRET_KEY, // Use a different, strong secret key for refresh tokens
    { expiresIn: '7d' } 
  );

  // Hash the refresh token before storing it in the database for security
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store the HASHED refresh token in the database
  // Note: We use findOneAndUpdate with upsert to prevent creating multiple tokens
  // if this function is called multiple times for the same user.
  await RefreshToken.findOneAndUpdate(
    { userId: user._id },
    {
      token: hashedRefreshToken,
      expiresAt: expiresAt,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { accessToken, refreshToken };
};



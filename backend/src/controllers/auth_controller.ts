import { Request, Response } from "express";
import User, { IUser } from "../models/user_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Document } from "mongoose";

const client = new OAuth2Client();
const googleSignin = async (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    if (email != null) {
      let user = await User.findOne({ email: email });
      if (user == null) {
        user = await User.create({
          email: email,
          password: "0",
          imgUrl: payload?.picture,
        });
      }
      const tokens = await generateTokens(user);
      res.status(200).send({
        email: user.email,
        _id: user._id,
        imgUrl: user.imgUrl,
        ...tokens,
      });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

const register = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;
  const imgUrl = req.body.imgUrl;
  if (!email || !password) {
    return res.status(400).send("missing email or password");
  }
  try {
    const rs = await User.findOne({ email: email });
    if (rs != null) {
      return res.status(406).send("email already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    const rs2 = await User.create({
      email: email,
      password: encryptedPassword,
      imgUrl: imgUrl,
    });
    const tokens = await generateTokens(rs2);
    res.status(201).send({
      email: rs2.email,
      _id: rs2._id,
      imgUrl: rs2.imgUrl,
      ...tokens,
    });
  } catch (err) {
    return res.status(400).send("error missing email or password");
  }
};

const generateTokens = async (user: Document & IUser) => {
  const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.JWT_REFRESH_SECRET
  );
  if (user.refreshTokens == null) {
    user.refreshTokens = [refreshToken];
  } else {
    user.refreshTokens.push(refreshToken);
  }
  await user.save();
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const login = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("missing email or password");
  }
  try {
    const user = await User.findOne({ email: email });
    if (user == null) {
      return res.status(401).send("email or password incorrect");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send("email or password incorrect");
    }

    const tokens = await generateTokens(user);
    return res.status(200).send(tokens);
  } catch (err) {
    return res.status(400).send("error missing email or password");
  }
};

const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (refreshToken == null) return res.sendStatus(401);
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, user: { _id: string }) => {
      console.log(err);
      if (err) return res.sendStatus(401);
      try {
        const userDb = await User.findOne({ _id: user._id });
        if (
          !userDb.refreshTokens ||
          !userDb.refreshTokens.includes(refreshToken)
        ) {
          userDb.refreshTokens = [];
          await userDb.save();
          return res.sendStatus(401);
        } else {
          userDb.refreshTokens = userDb.refreshTokens.filter(
            (t) => t !== refreshToken
          );
          await userDb.save();
          return res.sendStatus(200);
        }
      } catch (err) {
        res.sendStatus(401).send(err.message);
      }
    }
  );
};

const refresh = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (refreshToken == null) return res.sendStatus(401);
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, user: { _id: string }) => {
      if (err) {
        console.log(err);
        return res.sendStatus(401);
      }
      try {
        const userDb = await User.findOne({ _id: user._id });
        if (
          !userDb.refreshTokens ||
          !userDb.refreshTokens.includes(refreshToken)
        ) {
          userDb.refreshTokens = [];
          await userDb.save();
          return res.sendStatus(401);
        }
        const accessToken = jwt.sign(
          { _id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRATION }
        );
        const newRefreshToken = jwt.sign(
          { _id: user._id },
          process.env.JWT_REFRESH_SECRET
        );
        userDb.refreshTokens = userDb.refreshTokens.filter(
          (t) => t !== refreshToken
        );
        userDb.refreshTokens.push(newRefreshToken);
        await userDb.save();
        return res.status(200).send({
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
      } catch (err) {
        res.sendStatus(401).send(err.message);
      }
    }
  );
};
const editProfile = async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).send("No access token provided");
  }

  try {
    // Verify the access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      _id: string;
    };

    // Find the user
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Get new values from request body
    const { email, password } = req.body;

    // Check if at least one field is provided
    if (!email && !password) {
      return res
        .status(400)
        .send("Please provide username or password to update");
    }

    // Update username if provided
    if (email) {
      // Check if username is already taken
      const existingUser = await User.findOne({ email: email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(409).send("Username already taken");
      }
      user.email = email;
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      user.password = encryptedPassword;
    }

    // Save the updated user
    await user.save();

    // Return updated user info (excluding password)
    return res.status(200).send({
      _id: user._id,
      email: user.email,
      username: user.email,
      imgUrl: user.imgUrl,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).send("Invalid token");
    }
    return res.status(400).send(err.message);
  }
};

// Add to your exports
export default {
  googleSignin,
  register,
  login,
  logout,
  refresh,
  editProfile, // Add this line
};

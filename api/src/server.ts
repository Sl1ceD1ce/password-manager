import express, { json } from "express";
import cors from "cors";
import { connect } from "mongoose";
const app = express();
import User from "../models/User.js";
import Post from "../models/Post.js";
import jwt, { JwtPayload } from "jsonwebtoken";
const { sign, verify } = jwt;
import { sha256 } from "js-sha256";
import cookieParser from "cookie-parser";
import { validateContents } from "./helpers.js";
import * as dotenv from "dotenv";

dotenv.config();

interface UserPayload extends JwtPayload {
  username: string;
  id: string;
}

app.use(
  cors({
    credentials: true,
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  })
);
app.use(cookieParser());
app.use(json());

// loading secrets and env variables
const key = process.env.KEY;
const secret = process.env.SECRET;

if (!key || !secret) {
  throw new Error("Missing required environment variables: KEY and/or SECRET");
}

connect(key);

app.post("/register", async (req, res) => {
  const { username } = req.body;
  let { password } = req.body;
  password = sha256(password); // change to bcrypt algorithm

  try {
    const userDoc = await User.create({ username, password });
    return res.json("ok");
  } catch (e) {
    return res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = sha256(password); // change to bcrypt algorithm

  const userDoc = await User.findOne({ username });
  if (userDoc === null) {
    return res.status(400).json({ error: "invalid username" });
  } else if (hashedPassword === userDoc.password) {
    sign(
      { username, id: userDoc._id },
      secret,
      { algorithm: "HS512" },
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: false, // use `true` if you're serving over HTTPS
            sameSite: "lax", // "none" if using HTTPS + cross-origin
            maxAge: 60 * 60 * 1000, // 1 hour expiry time
          })
          .json({
            id: userDoc._id,
            username,
          });
      }
    );
  } else {
    return res.status(400).json({ error: "invalid credentials" });
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  try {
    verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
    });
  } catch (e) {
    return res.status(400).json(req.cookies);
  }
});

app.post("/logout", (req, res) => {
  res
    .cookie("token", "", {
      maxAge: 0,
    })
    .json("success");
});

// create a new password post
app.post("/post", async (req, res) => {
  const { website, username, password } = req.body;
  const { token } = req.cookies;
  // ensure check to validate website, username and password.

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    validateContents(website, username, password);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }

  // ensure to enrypt before storage
  try {
    const info = verify(token, secret) as UserPayload;
    const userID = info.id;

    await Post.create({ website, username, password, userID });
    return res.json("success");
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

// get all passwords posts from database for a given user
app.get("/post", async (req, res) => {
  const { token } = req.cookies;
  try {
    const info = verify(token, secret) as UserPayload;
    const userID = info.id;
    return res.json(await Post.find({ userID }));
  } catch (e) {
    return res.status(400).json({ error: "invalid token" });
  }
});

// edit a password post
app.put("/post", async (req, res) => {
  const { token } = req.cookies;
  const { postId, website, username, password } = req.body;

  // ensure to ecnrypt before storage

  const info = verify(token, secret) as UserPayload; // verify valid token

  try {
    validateContents(website, username, password);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }

  const postDoc = await Post.findOne({ _id: postId }); // find post
  if (info === null) {
    res.status(400).json({ error: "invalid username" }); // check token isn't invalid
  } else if (postDoc === null) {
    res.status(404).json({ error: "not found" }); // check postId isn't invalid
  } else if (info.id === postDoc.userID) {
    if (postDoc.userID === info.id) {
      await Post.updateOne(
        { _id: postId },
        {
          $set: {
            website,
            username,
            password,
          },
        }
      );
      return res.json("completed");
    } else {
      return res.status(400).json({ error: "invalid credentials" });
    }
  } else {
    return res.status(400).json({ error: "invalid credentials" });
  }
});

// delete a password post
app.delete("/post", async (req, res) => {
  const { token } = req.cookies;
  const { postId } = req.body;

  const info = verify(token, secret) as UserPayload; // verify valid token
  const postDoc = await Post.findOne({ _id: postId }); // find post
  if (info === null) {
    res.status(400).json({ error: "invalid username" }); // check token isn't invalid
  } else if (postDoc === null) {
    res.status(404).json({ error: "not found" }); // check postId isn't invalid
  } else if (info.id === postDoc.userID) {
    if (postDoc.userID === info.id) {
      await Post.deleteOne({ _id: postId });
      return res.json("completed");
    } else {
      return res.status(400).json({ error: "invalid credentials" });
    }
  } else {
    return res.status(400).json({ error: "invalid credentials" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

import express, { json } from "express";
import cors from "cors";
import { connect } from "mongoose";
const app = express();
import User from "../models/User.js";
import Post from "../models/Post.js";
import jwt, { JwtPayload } from "jsonwebtoken";
const { sign, verify } = jwt;
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import { validateContents } from "./helpers.js";
import * as dotenv from "dotenv";
import aes256 from "aes256";

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
const apiKey = process.env.KEY;
const secret = process.env.SECRET;
const aesKey = process.env.AES_KEY;
const saltRounds = 10;

if (!apiKey || !secret || !aesKey) {
  throw new Error("Missing required environment variables: KEY and/or SECRET");
}

connect(apiKey);

app.post("/register", async (req, res) => {
  const { username } = req.body;
  let { password } = req.body;
  const salt = bcrypt.genSaltSync(saltRounds);
  password = bcrypt.hashSync(password, salt);

  try {
    const userDoc = await User.create({ username, password });
    return res.json("ok");
  } catch (e: any) {
    return res.status(400).json("The username or password is not valid");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const userDoc = await User.findOne({ username });
  if (userDoc === null) {
    return res.status(400).json({ error: "invalid username" });
  } else if (bcrypt.compareSync(password, userDoc.password)) {
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
    return res.status(401).json({ error: "unauthorised" });
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
  let { website, username, password } = req.body;
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
  website = aes256.encrypt(aesKey, website);
  username = aes256.encrypt(aesKey, username);
  password = aes256.encrypt(aesKey, password);

  try {
    const info = verify(token, secret) as UserPayload;
    const userID = info.id;

    await Post.create({ website, username, password, userID });
    return res.json("success");
  } catch (e: any) {
    return res.status(400).json({ error: "request was malformed or invalid" });
  }
});

// get all passwords posts from database for a given user
app.get("/post", async (req, res) => {
  const { token } = req.cookies;
  try {
    const info = verify(token, secret) as UserPayload;
    const userID = info.id;


    let posts = await Post.find({ userID });

    const decryptedPosts = posts.map((post) => ({
      website: aes256.decrypt(aesKey, post.website),
      username: aes256.decrypt(aesKey, post.username),
      password: aes256.decrypt(aesKey, post.password),
      _id: post._id,
    }));

    return res.json(decryptedPosts);
  } catch (e) {
    return res.status(401).json({ error: "invalid token" });
  }
});

// edit a password post
app.put("/post", async (req, res) => {
  const { token } = req.cookies;
  let { postId, website, username, password } = req.body;

  const info = verify(token, secret) as UserPayload; // verify valid token

  try {
    validateContents(website, username, password);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }

  website = aes256.encrypt(aesKey, website);
  username = aes256.encrypt(aesKey, username);
  password = aes256.encrypt(aesKey, password);

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

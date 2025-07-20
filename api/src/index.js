const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const User = require("../models/User");
const Post = require("../models/Post");
var jwt = require("jsonwebtoken");
var sha256 = require("js-sha256");
const cookieParser = require("cookie-parser");
const { validateContents } = require("./helpers");
require("dotenv").config();

app.use(
  cors({
    credentials: true,
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  })
);
app.use(cookieParser());
app.use(express.json());

// loading secrets and env variables
const key = process.env.KEY;
const secret = process.env.SECRET;
mongoose.connect(key);

app.post("/register", async (req, res) => {
  const { username } = req.body;
  let { password } = req.body;
  password = sha256(password); // change to bcrypt algorithm

  try {
    const userDoc = await User.create({ username, password });
    res.json("ok");
  } catch (e) {
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = sha256(password); // change to bcrypt algorithm

  const userDoc = await User.findOne({ username });
  if (userDoc === null) {
    res.status(400).json({ error: "invalid username" });
  } else if (hashedPassword === userDoc.password) {
    jwt.sign(
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
    res.status(400).json({ error: "invalid credentials" });
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  try {
    jwt.verify(token, secret, {}, (err, info) => {
      if (err) throw err;
      res.json(info);
    });
  } catch (e) {
    res.status(400).json(req.cookies);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("success");
});

// create a new password post
app.post("/post", async (req, res) => {
  const { website, username, password } = req.body;
  const { token } = req.cookies;
  // ensure check to validate website, username and password.
  try {
    validateContents(website, username, password);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }

  // ensure to enrypt before storage
  try {
    const info = jwt.verify(token, secret);
    const userID = info.id;
    await Post.create({ website, username, password, userID });
    res.json("success");
  } catch (e) {
    console.log(token);
    res.status(400).json({ error: "invalid token" });
  }
});

// get all passwords posts from database for a given user
app.get("/post", async (req, res) => {
  const { token } = req.cookies;
  try {
    const info = jwt.verify(token, secret);
    const userID = info.id;
    res.json(await Post.find({ userID }));
  } catch (e) {
    res.status(400).json({ error: "invalid token" });
  }
});

// edit a password post
app.put("/post", async (req, res) => {
  const { token } = req.cookies;
  const { postId, website, username, password } = req.body;
  
  // ensure to ecnrypt before storage

  const info = jwt.verify(token, secret); // verify valid token

  try {
    validateContents(website, username, password);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }

  const postDoc = await Post.findOne({ _id: postId }); // find post
  if (info === null) {
    res.status(400).json({ error: "invalid username" }); // check token isn't invalid
  } else if (postDoc === null) {
    res.status(404).json({ error: "not found" }); // check postId isn't invalid
  } else if (info.id === postDoc._id) {
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
      res.json("completed");
    } else {
      res.status(400).json({ error: "invalid credentials" });
    }
  } else {
    res.status(400).json({ error: "invalid credentials" });
  }
});

// delete a password post
app.delete("/post", async (req, res) => {
  const { token } = req.cookies;
  const { postId } = req.body;

  const info = jwt.verify(token, secret); // verify valid token
  const postDoc = await Post.findOne({ _id: postId }); // find post
  if (info === null) {
    res.status(400).json({ error: "invalid username" }); // check token isn't invalid
  } else if (postDoc === null) {
    res.status(404).json({ error: "not found" }); // check postId isn't invalid
  } else if (info.id === postDoc._id) {
    if (postDoc.userID === info.id) {
      await Post.deleteOne({ _id: postId });
      res.json("completed");
    } else {
      res.status(400).json({ error: "invalid credentials" });
    }
  } else {
    res.status(400).json({ error: "invalid credentials" });
  }
});

app.listen(4000);

const express = require("express");
const route = new express.Router();
const User = require("../src/models/user");
const multer = require("multer");
const auth = require("../src/middleware/auth");
const { sendWelcomeMail,sendDeleteMail } = require("../src/emails/account");
const sharp = require("sharp");
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload image!!"));
    }
    cb(undefined, true);
  },
});
route.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    req.user.save();
    res.send();
  } catch (e) {
    res.status(400).send();
  }
});
route.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const uploadedImage = await sharp(req.file.buffer)
        .resize({ width: 300, height: 300 })
        .png()
        .toBuffer();
      req.user.avatar = uploadedImage;
      await req.user.save();
      res.send("Uploaded");
    } catch (e) {
      res.status(400).send(e.message);
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
route.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.end(user.avatar, "binary");
  } catch (error) {
    res.status(404).send();
  }
});
route.post("/users/login", async (req, res) => {
  try {
   
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
route.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send();
  }
});
route.post("/users/logOutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send();
  }
});
route.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
 
});
route.get("/users/:id", async (req, res) => {
  let _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send("No user");
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send();
  }
 
});
route.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "age", "email", "password"];
  const isAllowed = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isAllowed) {
    return res.status(400).send();
  }

  try {
   
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});
route.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeMail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }

});
route.delete("/users/me", auth, async (req, res) => {
  try {
  
    req.user.remove();
    sendDeleteMail(req.user.email,req.user.name)
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e.message);
  }
});
module.exports = route;

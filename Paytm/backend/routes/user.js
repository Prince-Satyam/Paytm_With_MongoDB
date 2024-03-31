const express = require("express");
const {signInValidation, signUpValidation, updateValidation} = require("../validation");
const {User} = require("../db");
const jwt = require("jsonwebtoken")
const {JWT_SECRET} = require("../config");
const  { authMiddleware } = require("../middleware");

const router = express.Router();

router.post("/sign-up", async (req, res) => {
  const payload = req.body;
  const parsedPayload = signUpValidation.safeParse(payload);
  if (!parsedPayload.success){
    res.status(411).json({
      msg: "User already exists or you have sent wrong inputs, pls try again!"
    })
    return;
  }

  const user = User.findOne({
    username: payload.username
  });

  if (user._id){
    return res.json({
      msg: "user already exists, pls try signing in"
    })
  }

  const dbUser = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });

  const token = jwt.sign({
    userId: dbUser._id
  }, JWT_SECRET);

  res.json({
    msg: "User added",
    token: token
  });
})

router.post("/sign-in", async (req, res) => {
  const payload = req.body;
  const {success} = signInValidation.safeParse(payload);
  if (!success){
    return res.status(411).json({
      msg: "Invalid email, try again"
    });
  }

  const user = await User.findOne({
    username: payload.username,
    password: payload.password
  })

  if (user){
    const token = jwt.sign({
      userId: user._id
    }, JWT_SECRET);

    res.json({token: token})
    return;
  }

  res.status(411).json({
    msg: "Something went wrong"
  })
})

router.put("/", authMiddleware, async (req, res) => {
  const payload = req.body;
  const {success} = updateValidation.safeParse(payload);

  if (!success){
    return res.status(411).json({
      msg: "Unable to update, try again"
    });
  }

  await User.updateOne(payload, {
    id: req.userId
  })

  res.json({
    msg: "Details updated"
  })
})

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find ({
    $or: [{
      firstName: {
        "$regex": filter
      }
    }, {
      lastName: {
        "$regex": filter
      }
    }]
  })

  res.json({
    user: users.map(user => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id
    }))
  })
})

module.exports = router;
const { User, validate } = require("../models/users");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/signup", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = new User(req.body);

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    user.password = await bcrypt.hash(user.password, salt);
    validateEmailAccessibility(req.body.email).then(async function (valid) {
      if (valid) {
        await user.save();
        res.send(user);
      } else {
        res.status(400).json({ message: 'Email already exists.' })
      }
    });

  } catch (error) {
    res.send("An error occured");
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -__v");
    res.send(user);
  } catch (error) {
    console.log(error);
    res.send("An error occured");
  }
});

function validateEmailAccessibility(email) {
  return User.findOne({ email: email }).then(function (result) {
    return !result
  });
}

module.exports = router;
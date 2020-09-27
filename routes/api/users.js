const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/User");

var username2;


router.get('/account', (req, res) => {
    const data = User.findOne({ email: username2 }, function (err, adventure) {
      // console.log(adventure.name);
      res.json({
              username: adventure.name,
              lastlogin: adventure.date,
              points: adventure.points,
              as: adventure.as
            });
    });
  });

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation
const { errors, isValid } = validateRegisterInput(req.body);
// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } 
    else {
      const date = new Date();
      var asa = req.body.as;
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        lastlogin: date,
        as: asa
      });
// Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});


// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
// router.get('/hey', (req, res) => res.send('ho!'));
router.post("/login", (req, res) => {
  console.log("PASSED");
  username2 = req.body.email;
  // Form validation
const { errors, isValid } = validateLoginInput(req.body);
// Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
// Find user by email
  User.findOne({ email }).then(user => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
// Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        var query = {'email': email};
        // req..date = ;
        User.findOneAndUpdate(query,{ date: new Date() }, {upsert: true}, function(err, doc) {
        if (err) return res.send(500, {error: err});
        // return res.send('Succesfully saved.');
        });
        const payload = {
          id: user.id,
          name: user.name
        };
// Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 31556926 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } 
      else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
// const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

// console.log(process.env.JWT_SECRET);



// Route1

// Create a user using: POST '/api/auth/createuser'. No login required
router.post('/createuser',[  
    body('name','Enter a valid name').isLength({ min: 3}),
    body('password','Enter a valid password').isLength({ min: 3 }),
    body('email','Enter a valid email').isEmail()], 
    async (req, res) => {
      try {
   
// Finds the validation errors in this request and wraps them in an object with handy functions
     const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({  success: false, errors: errors.array() });
    }

      // Check whether user already exists
      let user = await User.findOne({
        email: req.body.email,
      });

       if (user) {
        return res.status(400).json({
          success: false,
          error: "Sorry, a user with this email already exists"
        });
      }

         // password hashing
    const salt = bcrypt.genSaltSync(10);
    let secPass = await bcrypt.hash(req.body.password, salt);

        user = new User({ 
         name: req.body.name,
        email: req.body.email,
        password: secPass
    });

      await user.save();

    const data = {
  user: {
    id: user.id
  }
};

// const token = jwt.sign(data, process.env.JWT_SECRET);
const token = jwt.sign(data, "mySecretKey123");
console.log(token);
   

return res.status(200).json({
  success: true,
  authToken: token
});


     } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
  }
});


// Route2

//  Authentic a user using: POST '/api/auth/login'. no login required
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists()
], async (req, res) => {
  try {

    // if there are errors, return Bad request and the errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find the user by email
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Please try to login with correct credentials"
      });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Please try to login with correct credentials"
      });
    }

    // Generate a JWT token
    // const token = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET);
    const token = jwt.sign(
  { user: { id: user.id } },
  "mySecretKey123"
);

    res.json({ token });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



// Route3

// Get logged in user details using: POST '/api/auth/getuser'. Login required

router.post('/getuser', fetchuser, async (req, res) => {

  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;
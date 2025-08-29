import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;


    // Validate inputs
    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing Details' });
    }


    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }


    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // Create and save user with default credit balance
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      creditBalance: 5 // default credits on registration
    }).save();


    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });


    res.json({
      success: true,
      token,
      user: { name: user.name, email: user.email }
    });


  } catch (error) {
    console.error('Register Error:', error.message);
    res.json({ success: false, message: error.message });
  }
};


// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;


    // Find user
    const user = await userModel.findOne({ email });


    if (!user) {
      return res.json({ success: false, message: 'User does not exist' });
    }


    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);


    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid Credentials' });
    }


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });


    res.json({
      success: true,
      token,
      user: { name: user.name, email: user.email }
    });


  } catch (error) {
    console.error('Login Error:', error.message);
    res.json({ success: false, message: error.message });
  }
};


// GET USER CREDITS
const userCredits = async (req, res) => {
  try {
    const { userId } = req.body;


    const user = await userModel.findById(userId);


    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }


    res.json({
      success: true,
      credits: user.creditBalance,
      user: { name: user.name, email: user.email }
    });


  } catch (error) {
    console.error('Credit Fetch Error:', error.message);
    res.json({ success: false, message: error.message });
  }
};


export { registerUser, loginUser, userCredits };
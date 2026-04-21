const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token banane ka secret key (Isko baad me .env me daal dena)
const JWT_SECRET = process.env.JWT_SECRET || 'opsmind_super_secret_key';

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save User
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate Token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res
      .status(201)
      .json({
        message: 'User created successfully',
        token,
        user: { name, email },
      });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: 'Invalid email or password' });

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: 'Invalid email or password' });

    // Generate Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully',
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

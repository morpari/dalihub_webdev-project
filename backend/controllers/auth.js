const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });
  
      await user.save();
  
      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
  
      res.status(201).json({ message: 'User registered successfully', accessToken });
    } catch (error) {
      console.error('Registration Error:', error);  // ✅ Log the actual error!
      res.status(500).json({ error: 'Error registering user' });
    }
};

const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
  
      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      // Generate JWT Access Token
      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
  
      // Generate Refresh Token
      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      // Store refresh token in the database
      user.refreshToken = refreshToken;
      await user.save();
  
      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ error: 'Error logging in' });
    }
};
  
const refreshToken = async (req, res) => {
    try {
      const { token } = req.body;
  
      if (!token) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }
  
      // Find user by refresh token
      const user = await User.findOne({ refreshToken: token });
      if (!user) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }
  
      // Verify the refresh token
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid refresh token' });
  
        // Generate new access token
        const accessToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        );
  
        res.json({ accessToken });
      });
    } catch (error) {
      console.error('Refresh Token Error:', error);
      res.status(500).json({ error: 'Error refreshing token' });
    }
  };
  
const logout = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Find the user with this refresh token
    const user = await User.findOne({ refreshToken: token });
    if (!user) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Remove the refresh token (logout the user)
    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Error logging out' });
  }
};
  

  
module.exports = { register, login, refreshToken, logout};

  


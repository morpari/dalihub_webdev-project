const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to generate tokens
const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// REGISTER USER
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        //Check if email or username already exists
        if (await User.findOne({ email })) {
            return res.status(400).json({ error: 'Email is already in use. Please use a different email.' });
        }
        if (await User.findOne({ username })) {
            return res.status(400).json({ error: 'Username is already taken. Try a different username.' });
        }

        // Hash password & create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken; // Store refresh token in DB
        await user.save();

        res.status(201).json({ message: 'User registered successfully', accessToken, refreshToken });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'An error occurred during registration. Please try again later.' });
    }
};

// LOGIN USER
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user & verify password
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken; //store new refresh token
        await user.save();

        res.status(200).json({ accessToken, refreshToken });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

// REFRESH TOKEN (Generate new access token)
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        // heck if token exists in the database
        const user = await User.findOne({ refreshToken: token });
        if (!user) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Verify the refresh token (Check if expired)
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Refresh token expired or invalid' });
            }

            // Generate new tokens
            const accessToken = generateAccessToken(user._id);
            const newRefreshToken = generateRefreshToken(user._id);

            // Store the new refresh token in DB
            user.refreshToken = newRefreshToken;
            await user.save();

            res.json({ accessToken, refreshToken: newRefreshToken });
        });

    } catch (error) {
        console.error('Refresh Token Error:', error);
        res.status(500).json({ error: 'Error refreshing token' });
    }
};

// LOGOUT (Invalidate refresh token)
const logout = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        // Find user with this refresh token
        const user = await User.findOne({ refreshToken: token });
        if (!user) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        //Remove the refresh token (logout the user)
        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: 'User logged out successfully' });

    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ error: 'Error logging out' });
    }
};

module.exports = { register, login, refreshToken, logout };

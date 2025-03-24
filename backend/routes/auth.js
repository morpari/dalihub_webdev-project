const express = require('express');
const passport = require('passport');
require('../config/passport'); // Load Google OAuth strategy
const { register, login, refreshToken, logout } = require('../controllers/auth');
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user authentication
 */

/**
 * @swagger
 * /auth/protected-check:
 *   get:
 *     summary: Check access token validity
 *     description: Protected route to verify if the access token is still valid.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access token is valid.
 *       401:
 *         description: Access token is missing or invalid.
 */
router.get("/protected-check", authMiddleware, (req, res) => {
  res.sendStatus(200); // Simple success response
});


/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Login with Google
 *     description: Redirects to Google for authentication.
 *     tags: [Authentication]
 */
router.get('/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],  
    })
  );
  
  /**
   * @swagger
   * /auth/google/callback:
   *   get:
   *     summary: Google authentication callback
   *     description: Handles the Google OAuth callback and issues JWT tokens.
   *     tags: [Authentication]
   */

  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    async (req, res) => {
      if (!req.user) {
        return res.redirect(`${process.env.FRONT_URL}/login?error=unauthorized`);
      }
  
      // User's refresh token is already stored in the database in passport.js
      const accessToken = req.user.accessToken;  // Use existing token
      const refreshToken = req.user.refreshToken; // Use the one from passport.js userId
      const userId = req.user.userId;
      console.log("Redirecting user with access token:", accessToken,"and refresh token", refreshToken);
      res.redirect(`${process.env.FRONT_URL}/auth/google/callback?token=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&userId=${encodeURIComponent(userId)}`);
    }
  );
  

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Issues a new access token using a valid refresh token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: The refresh token issued during login.
 *     responses:
 *       200:
 *         description: New access token issued successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The new access token.
 *       400:
 *         description: Refresh token is missing from the request.
 *       403:
 *         description: Invalid or expired refresh token.
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out user
 *     description: Removes the refresh token from the database, logging out the user.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: The refresh token to be invalidated.
 *     responses:
 *       200:
 *         description: User logged out successfully.
 *       400:
 *         description: Refresh token is required.
 *       403:
 *         description: Invalid refresh token.
 */
router.post('/logout',authMiddleware, logout);

module.exports = router;

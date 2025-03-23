const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getUserById,
  getAllUsers,
  updateUserProfile
} = require("../controllers/users");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (Protected)
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/:id", authMiddleware, getUserById);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Protected)
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user profile (username and/or profile image)
 *     security:
 *       - bearerAuth: []
 *     tags: [Users]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newUsername123"
 *               upload:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully updated profile
 *       400:
 *         description: Username is already taken or invalid request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", authMiddleware, upload.single("upload"), updateUserProfile);

module.exports = router;

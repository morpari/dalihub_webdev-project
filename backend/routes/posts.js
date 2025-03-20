const express = require('express');
const rateLimit = require("express-rate-limit");
const {
  getAllPosts,
  getPostById,
  getPostsBySender,
  addPost,
  updatePost,
  generateImage,
} = require('../controllers/posts');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API for managing posts
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post (Requires Authentication)
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 */
router.post('/', authMiddleware, addPost);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get paginated list of all posts (Requires Authentication)
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of posts per page.
 *     responses:
 *       200:
 *         description: A paginated list of posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */

router.get('/',authMiddleware, getAllPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post data
 */
router.get('/:id',authMiddleware, getPostById);

/**
 * @swagger
 * /posts/user/{senderId}:
 *   get:
 *     summary: Get paginated posts of a specific user (Requires Authentication)
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose posts are being retrieved.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: The number of posts per page.
 *     responses:
 *       200:
 *         description: A paginated list of posts by the specified user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Sender ID is required.
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */

router.get('/user/:senderId', authMiddleware, getPostsBySender);


/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post (Requires Authentication & Must be Owner)
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       403:
 *         description: Unauthorized (Not the owner)
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/generate-image:
 *   post:
 *     summary: Generate an AI image using DALL·E
 *     description: Generates an image based on a text prompt using OpenAI's DALL·E API.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 example: "A futuristic city at sunset"
 *     responses:
 *       200:
 *         description: Image generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: "https://openai.com/generated-image-url.jpg"
 *       400:
 *         description: Bad request (missing prompt)
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */

const imageGenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Rate limit exceeded. Try again later." },
});

router.post("/generate-image", authMiddleware, imageGenLimiter, generateImage);


module.exports = router;

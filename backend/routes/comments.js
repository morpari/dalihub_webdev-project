const express = require('express');
const {
  getCommentById,
  getAllCommentsForPost,
  addComment,
  updateComment,
  deleteComment,
} = require('../controllers/comments');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API for managing comments
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Add a comment to a post (Requires Authentication)
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - content
 *             properties:
 *               postId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized (Missing or invalid token)
 */
router.post('/', authMiddleware, addComment);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment data
 *       404:
 *         description: Comment not found
 */
router.get('/:id', authMiddleware, getCommentById);

/**
 * @swagger
 * /comments/post/{postId}:
 *   get:
 *     summary: Get comments for a specific post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments for the post
 *       400:
 *         description: Missing post ID
 */
router.get('/post/:postId',authMiddleware, getAllCommentsForPost);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment (Requires Authentication & Must be Owner)
 *     tags: [Comments]
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated
 *       403:
 *         description: Unauthorized (Not the owner)
 *       404:
 *         description: Comment not found
 */
router.put('/:id', authMiddleware, authMiddleware, updateComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment (Requires Authentication & Must be Owner)
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Unauthorized (Not the owner)
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', authMiddleware, authMiddleware, deleteComment);

module.exports = router;

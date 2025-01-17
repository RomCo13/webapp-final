import express from "express";
const router = express.Router();
import { StudentPostController } from "../controllers/student_post_controller";
import authMiddleware from "../common/auth_middleware";

/**
 * @swagger
 * tags:
 *   name: StudentPosts
 *   description: API for managing student posts
 */

/**
 * @swagger
 * /studentpost:
 *   get:
 *     summary: Get all student posts
 *     tags: [StudentPosts]
 *     responses:
 *       200:
 *         description: List of student posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *       500:
 *         description: Server error
 */
router.get("/", StudentPostController.getPosts);

/**
 * @swagger
 * /studentpost/{id}:
 *   get:
 *     summary: Get a student post by ID
 *     tags: [StudentPosts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student post
 *     responses:
 *       200:
 *         description: Student post retrieved successfully
 *       404:
 *         description: Student post not found
 *       500:
 *         description: Server error
 */
router.get("/:id", StudentPostController.getPostById);

/**
 * @swagger
 * /studentpost:
 *   post:
 *     summary: Create a new student post
 *     tags: [StudentPosts]
 *     security:
 *       - bearerAuth: []
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
 *         description: Student post created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, StudentPostController.createPost);

/**
 * @swagger
 * /studentpost/:
 *   put:
 *     summary: Update a student post by ID
 *     tags: [StudentPosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student post
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
 *         description: Student post updated successfully
 *       404:
 *         description: Student post not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, StudentPostController.putById);

/**
 * @swagger
 * /studentpost/{id}:
 *   delete:
 *     summary: Delete a student post by ID
 *     tags: [StudentPosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student post
 *     responses:
 *       200:
 *         description: Student post deleted successfully
 *       404:
 *         description: Student post not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, StudentPostController.deleteById);

export default router;
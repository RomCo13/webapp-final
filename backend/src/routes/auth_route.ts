import express from "express";
const router = express.Router();
import authController from "../controllers/auth_controller";
/**
* @swagger
* tags:
*   name: Auth
*   description: The Authentication API
*/


/**
* @swagger
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*/

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - email
*         - password
*       properties:
*         email:
*           type: string
*           description: The user email
*         password:
*           type: string
*           description: The user password
*         username:
*           type: string
*           description: The user username
*         imgUrl:
*           type: string
*           description: The user profile image URL
*       example:
*         email: 'bob@gmail.com'
*         password: '123456'
*         username: 'bob123'
*         imgUrl: 'https://example.com/image.jpg'
*/

/**
* @swagger
* /auth/register:
*   post:
*     summary: registers a new user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/User'
*     responses:
*       200:
*         description: The new user
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*/
router.post("/register", authController.register);
router.post("/google", authController.googleSignin);

/**
* @swagger
* components:
*   schemas:
*     Tokens:
*       type: object
*       required:
*         - accessToken
*         - refreshToken
*       properties:
*         accessToken:
*           type: string
*           description: The JWT access token
*         refreshToken:
*           type: string
*           description: The JWT refresh token
*       example:
*         accessToken: '123cd123x1xx1'
*         refreshToken: '134r2134cr1x3c'
*/


/**
* @swagger
* /auth/login:
*   post:
*     summary: registers a new user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/User'
*     responses:
*       200:
*         description: The acess & refresh tokens
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Tokens'
*/
router.post("/login", authController.login);

/**
* @swagger
* /auth/logout:
*   get:
*     summary: logout a user
*     tags: [Auth]
*     description: need to provide the refresh token in the auth header
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: logout completed successfully
*/

/**
* @swagger
* /auth/edit:
*   put:
*     summary: Edit user profile
*     tags: [Auth]
*     description: Update username and/or password for authenticated user
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               username:
*                 type: string
*                 description: New username
*               password:
*                 type: string
*                 description: New password
*             example:
*               username: 'newusername123'
*               password: 'newpassword456'
*     responses:
*       200:
*         description: Updated user profile
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 _id:
*                   type: string
*                 email:
*                   type: string
*                 username:
*                   type: string
*                 imgUrl:
*                   type: string
*               example:
*                 _id: '123456789'
*                 email: 'bob@gmail.com'
*                 username: 'newusername123'
*                 imgUrl: 'https://example.com/image.jpg'
*       401:
*         description: Unauthorized - Invalid or missing token
*       400:
*         description: Bad request - Missing required fields
*       409:
*         description: Conflict - Username already taken
*/
router.put("/edit", authController.editProfile);

router.get("/logout", authController.logout);
router.get("/refresh", authController.refresh);

export default router;
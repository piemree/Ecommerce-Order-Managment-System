const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const validateSchema = require('../middlewares/validateSchema.middleware.js');
const { loginSchema, registerSchema } = require('../schemas/auth.schema.js');

router.post('/login', validateSchema(loginSchema), authController.login);
router.post('/register', validateSchema(registerSchema), authController.register);




module.exports = router;
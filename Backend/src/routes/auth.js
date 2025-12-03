// user authentication routes (register/login)
const express = require('express');
const router = express.Router();


// Use modular register and login routers
const registerRouter = require('./recipe');
const loginRouter = require('./login-mysql');

router.use('/register', registerRouter);
router.use('/login', loginRouter);

module.exports = router;

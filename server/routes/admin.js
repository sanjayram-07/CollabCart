const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');

router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.post('/send-magic-link', ctrl.sendMagicLink);
router.post('/verify-magic-link', ctrl.verifyMagicLink);

module.exports = router;

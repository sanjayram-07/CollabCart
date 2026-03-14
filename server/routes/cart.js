const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');

router.post('/create', ctrl.createSession);
router.post('/join', ctrl.joinSession);
router.get('/:roomId', ctrl.getSession);
router.post('/item', ctrl.addItem);
router.delete('/item', ctrl.removeItem);
router.put('/item/quantity', ctrl.updateQuantity);
router.post('/checkout/start', ctrl.startCheckout);
router.post('/checkout/complete', ctrl.completeCheckout);
router.post('/vote', ctrl.castVote);

module.exports = router;

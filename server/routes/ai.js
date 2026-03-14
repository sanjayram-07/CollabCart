const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/aiController');

router.get('/recommendations/:productId', ctrl.getRecommendations);
router.post('/budget-recommendation', ctrl.getBudgetRecommendation);

module.exports = router;

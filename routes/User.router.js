const { Router } = require('express');
const UserController = require('../controllers/User.controller');

const router = Router();

router.post('/:walletAddress/buy', UserController.buyProduct);
router.get('/:walletAddress/orders', UserController.getOrders);

module.exports = router;

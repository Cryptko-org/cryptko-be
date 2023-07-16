const { Router } = require('express');
const ProductController = require('../controllers/Product.controller');

const router = Router();

router.get('/get-products', ProductController.getProducts);
router.get('/:productId', ProductController.getProduct);

module.exports = router;

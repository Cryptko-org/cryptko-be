const ProductService = require('../services/Product.service');
const ProductDto = require('../dtos/Product.dto');

class ProductController {
  async getProducts(req, res, next) {
    try {
      const { page, count, modelIds, memoryIds, sortBy, isInStock, isUsed } = req.query;

      const data = await ProductService.getProducts(
        page,
        count,
        modelIds,
        memoryIds,
        sortBy,
        isInStock,
        isUsed
      );

      res.status(200).send({ data, success: true });
    } catch (err) {
      res.status(400).send({
        error: {
          message: err.message,
        },
        success: false,
      });
    }
  }

  async getProduct(req, res, next) {
    try {
      const { productId } = req.params;
      const data = await ProductService.getProductById(productId);

      res.status(200).send({ data, success: true });
    } catch (err) {
      res.status(400).send({
        error: {
          message: err.message,
        },
        success: false,
      });
    }
  }
}

module.exports = new ProductController();

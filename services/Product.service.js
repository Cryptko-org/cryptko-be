const ProductModel = require('../models/Products.model');
const ProductDto = require('../dtos/Product.dto');

class ProductService {
  async getProducts(
    page = 1,
    count = 10,
    modelIds = '',
    memoryIds = '',
    sortBy = '',
    isInStock = null,
    isUsed = ''
  ) {
    const countSkips = (page - 1) * count;
    const query = {};

    if (modelIds) {
      const modelIdsArray = modelIds.split(',');
      query.modelId = { $in: modelIdsArray };
    }

    if (memoryIds) {
      const memoryIdsArray = memoryIds.split(',');
      query.memoryId = { $in: memoryIdsArray };
    }

    if (JSON.parse(isInStock) != null) {
      query.isInStock = JSON.parse(isInStock);
    }

    if (isUsed) {
      const isUsedArray = isUsed.split(',');

      if (isUsedArray.includes('USED') && !isUsedArray.includes('NOT_USED')) {
        query.isUsed = true;
      } else if (isUsedArray.includes('NOT_USED') && !isUsedArray.includes('USED')) {
        query.isUsed = false;
      }
    }

    const sort = {};

    switch (sortBy) {
      case 'HIGH_PRICE_FIRST':
        sort.priceBnb = -1;
        break;
      case 'LOW_PRICE_FIRST':
        sort.priceBnb = 1;
        break;
      case 'LOW_STARS_FIRST':
        sort.countStars = 1;
        break;
      case 'HIGH_STARS_FIRST':
        sort.countStars = -1;
        break;
      default:
        console.log('No sort by params!');
        break;
    }

    console.log(query);

    const products = await ProductModel.find(query).sort(sort).skip(countSkips).limit(count);

    const totalItems = await ProductModel.countDocuments(query);

    return {
      products: products.map((product) => new ProductDto(product)),
      pagination: {
        itemsPerPage: +count,
        currentPage: +page,
        totalItems,
      },
    };
  }

  async getProductById(productId) {
    const product = await ProductModel.findById(productId);
    return {
      product: new ProductDto(product),
    };
  }
}

module.exports = new ProductService();

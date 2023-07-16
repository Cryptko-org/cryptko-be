const { Schema, model } = require('mongoose');

const OrderModel = new Schema({
  productId: {
    ref: 'product',
    type: String,
  },
  txhash: String,
  status: String, // 'PENDING/SUCCESS/FAILURE'
  description: String,
  orderTime: Number,
  updateStatusTime: Number,
});

module.exports = model('order', OrderModel);

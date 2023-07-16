const { Schema, model } = require('mongoose');

const ProductModel = new Schema({
  _id: String,
  type: String,
  modelId: String,
  memoryId: String,
  smallImageLink: String,
  largeImageLink: String,
  title: String,
  priceUah: Number,
  priceBnb: Number,
  countStars: Number,
  maxStars: Number,
  countViews: Number,
  link: String,
  isInStock: Boolean,
  isUsed: Boolean,
});

module.exports = model('product', ProductModel);

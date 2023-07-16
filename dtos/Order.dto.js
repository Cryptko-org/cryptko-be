module.exports = class OrderDto {
  id;
  productId;
  status;
  txhash;
  description;
  orderTime;
  updateStatusTime;

  constructor(model) {
    this.id = model._id;
    this.txhash = model.txhash;
    this.productId = model.productId;
    this.status = model.status;
    this.description = model.description;
    this.orderTime = model.orderTime;
    this.updateStatusTime = model.updateStatusTime;
  }
};

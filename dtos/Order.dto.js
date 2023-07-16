module.exports = class OrderDto {
  id;
  productId;
  status;
  txhash;
  description;
  orderTime;
  updateStatusTime;
  fullName;
  phoneNumber;
  deliveryCityRef;
  deliveryWarehouse;

  constructor(model) {
    this.id = model._id;
    this.fullName = model.fullName;
    this.phoneNumber = model.phoneNumber;
    this.deliveryCityRef = model.deliveryCityRef;
    this.deliveryWarehouse = model.deliveryWarehouse;
    this.txhash = model.txhash;
    this.productId = model.productId;
    this.status = model.status;
    this.description = model.description;
    this.orderTime = model.orderTime;
    this.updateStatusTime = model.updateStatusTime;
  }
};

module.exports = class ProductDto {
  id;
  type;
  modelId;
  smallImageLink;
  largeImageLink;
  title;
  priceUah;
  priceBnb;
  countStars;
  maxStars;
  countViews;
  link;
  isInStock;
  isUsed;

  constructor(model) {
    this.id = model._id;
    this.type = model.type;
    this.modelId = model.modelId;
    this.smallImageLink = model.smallImageLink;
    this.largeImageLink = model.largeImageLink;
    this.title = model.title;
    this.priceUah = model.priceUah;
    this.priceBnb = model.priceBnb;
    this.countStars = model.countStars;
    this.maxStars = model.maxStars;
    this.countViews = model.countViews;
    this.link = model.link;
    this.isInStock = model.isInStock;
    this.isUsed = model.isUsed;
  }
};

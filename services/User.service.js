const mongoose = require('mongoose');
const UserModel = require('../models/User.model');
const OrderModel = require('../models/Order.model');
const OrderDto = require('../dtos/Order.dto');

class UserService {
  async buyProduct(walletAddress, productId, txhash, customerInfo) {
    if (!walletAddress) {
      throw Error('Wallet address missed!');
    }

    if (!productId) {
      throw Error('Product id missed!');
    }

    if (!txhash) {
      throw Error('Txhash missed!');
    }

    const { fullName, phoneNumber, deliveryCityRef, deliveryWarehouse } = customerInfo;

    if (!fullName) {
      throw Error('CustomerInfo field missed fullName!');
    } else if (!phoneNumber) {
      throw Error('CustomerInfo field missed phoneNumber!');
    } else if (!deliveryCityRef) {
      throw Error('CustomerInfo field missed deliveryCityRef!');
    } else if (!deliveryWarehouse) {
      throw Error('CustomerInfo field missed deliveryWarehouse!');
    }

    let user = await UserModel.findOne({ walletAddress });
    if (!user) {
      user = await this.registerUser(walletAddress);
    }

    const isAlreadyBought = await OrderModel.findOne({ txhash });
    if (isAlreadyBought) {
      throw Error('The product has been already bought with this txhash!');
    }

    const orderId = new mongoose.Types.ObjectId();
    const order = await new OrderModel(
      {
        _id: orderId,
        productId,
        txhash,
        fullName,
        phoneNumber,
        deliveryCityRef,
        deliveryWarehouse,
        orderTime: new Date().getTime(),
        status: 'PENDING',
      },
      { new: true }
    );
    user.boughtProducts.push(orderId);

    await order.save();
    await user.save();

    return new OrderDto(order);
  }

  async getOrdersByWalletAddress(walletAddress) {
    const userData = await UserModel.findOne({ walletAddress });

    if (!userData) {
      return {};
    }

    const orders = await OrderModel.find({ _id: { $in: userData.boughtProducts } });

    return { orders: orders.map((order) => new OrderDto(order)) };
  }

  async registerUser(walletAddress) {
    const user = await new UserModel(
      {
        _id: new mongoose.Types.ObjectId(),
        walletAddress,
        boughtProducts: [],
      },
      { new: true }
    );

    await user.save();

    return user;
  }
}

module.exports = new UserService();

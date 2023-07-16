const UserService = require('../services/User.service');

class UserController {
  async buyProduct(req, res, next) {
    try {
      const { walletAddress } = req.params;
      const { productId, txhash, customerInfo } = req.body;
      console.log(walletAddress, productId, txhash);

      const data = await UserService.buyProduct(walletAddress, productId, txhash, customerInfo);

      return res.status(200).send({ data, success: true });
    } catch (err) {
      return res.status(400).send({
        error: {
          message: err.message,
        },
        success: false,
      });
    }
  }

  async getOrders(req, res, next) {
    try {
      const { walletAddress } = req.params;

      const data = await UserService.getOrdersByWalletAddress(walletAddress);

      return res.status(200).send({ data, success: true });
    } catch (err) {
      return res.status(400).send({
        error: {
          message: err.message,
        },
        success: false,
      });
    }
  }
}

module.exports = new UserController();

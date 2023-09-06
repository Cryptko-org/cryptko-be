const axios = require('axios');
const qs = require('qs');
const OrderModel = require('../models/Order.model');
const ProductModel = require('../models/Products.model');
const updateProductsPrices = require('./update-prices.job');

const AVAILABLE_COUNT_REQUESTS_PER_SECOND = 5;
const DELAY_BETWEEN_RESPONSES = 1250;

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const convertHexadecimalWEIToNumber = (value) => {
  return Number(value) / 10 ** 18;
};

const getTransactionByHash = async (txhash) => {
  const queries = qs.stringify({
    module: 'proxy',
    action: 'eth_getTransactionByHash',
    txhash,
    apikey: process.env.BSC_SCAN_API_KEY,
  });

  return (await axios.get('https://api-testnet.bscscan.com/api?' + queries)).data.result;
};

const getTransactionReceiptByHash = async (txhash) => {
  const queries = qs.stringify({
    module: 'proxy',
    action: 'eth_getTransactionReceipt',
    txhash,
    apikey: process.env.BSC_SCAN_API_KEY,
  });

  return (await axios.get('https://api-testnet.bscscan.com/api?' + queries)).data.result;
};

const getTransactionStatus = async (order) => {
  const productData = await ProductModel.findById(order.productId);

  if (!productData) {
    console.log(`Product with id: ${order.productId} does not exist!`);
    return {
      status: 'FAILURE',
      description: `Product with id: ${order.productId}, does not exist!`,
    };
  }

  return getTransactionByHash(order.txhash)
    .then(async (transactionData) => {
      if (!transactionData) {
        console.log('Transaction data does not exist:', transactionData);
        return {
          status: 'PENDING',
          description: 'Transaction data does not exist',
        };
      }

      const payedPrice = convertHexadecimalWEIToNumber(transactionData.value);
      if (payedPrice < productData?.priceBnb) {
        console.log('Payed price incorrect! Payed price:', payedPrice);
        return {
          status: 'FAILURE',
          description: 'Payed price incorrect! Payed price: ' + payedPrice,
        };
      }

      if (transactionData.chainId !== process.env.REQUIRED_CHAIN_ID) {
        console.log('Chain id incorrect! Chain id:', transactionData.chainId);
        return {
          status: 'FAILURE',
          description: 'Chain id incorrect! Chain id: ' + transactionData.chainId,
        };
      }

      if (transactionData.to.toLowerCase() !== process.env.WALLET_ADDRESS_TO_SEND_MONEY) {
        console.log('Wallet "to" incorrect! Wallet "to":', transactionData.to.toLowerCase());
        return {
          status: 'FAILURE',
          description: 'Wallet "to" incorrect! Wallet "to": ' + transactionData.to.toLowerCase(),
        };
      }

      await timeout(DELAY_BETWEEN_RESPONSES);

      return getTransactionReceiptByHash(order.txhash)
        .then((transactionReceiptData) => {
          if (!transactionReceiptData) {
            console.log('Transaction data receipt does not exist:', transactionReceiptData);
            return {
              status: 'PENDING',
              description: 'Transaction data receipt does not exist!',
            };
          }

          if (transactionReceiptData.status !== '0x1') {
            console.log('Transaction failed with status:', transactionReceiptData);
            return {
              status: 'FAILURE',
              description: 'Transaction failed with status: ' + transactionReceiptData,
            };
          }

          return {
            status: 'SUCCESS',
            description: 'Transaction confirmed!',
          };
        })
        .catch((err) => {
          console.log('Something went wrong! Error: ', err);
          return {
            status: 'FAILURE',
            description: 'Error: ' + err.message + '. Please contact to support!',
          };
        });
    })
    .catch((err) => {
      console.log('Something went wrong! Error: ', err);
      return {
        status: 'FAILURE',
        description: 'Error: ' + err.message + '. Please contact to support!',
      };
    });
};

const updatePendingOrders = async () => {
  try {
    return OrderModel.find({ status: 'PENDING' })
      .then((orders) => {
        return Promise.all(
          orders.map(async (order, index) => {
            const timeoutTime =
              Math.floor((index + 1) / AVAILABLE_COUNT_REQUESTS_PER_SECOND) *
              (DELAY_BETWEEN_RESPONSES * 3); // getTransactionStatus have 2 requests (+1 for response time)

            await timeout(timeoutTime);

            const { status, description } = await getTransactionStatus(order);

            order.status = status;
            order.description = description;
            order.updateStatusTime = new Date().getTime();
            return await order.save();
          })
        );
      })
      .then((transactions) => {
        console.log(`Transactions updated! Updated transactions:`, transactions);
        return transactions;
      })
      .catch((error) => {
        console.error('Error updating documents:', error);
      });
  } catch (err) {
    console.log('Something went wrong while updating orders! Error:', err);
  }
};

const checkTransactionsStatus = () => {
  console.log('Check transactions job!');

  return updatePendingOrders()
    .then(async (orders) => {
      const isHavePendingTransactions = orders.some((order) => order.status === 'PENDING');

      if (isHavePendingTransactions) {
        console.log('Have pending transactions!');
        return;
      }

      console.log('Updating product prices!');

      return updateProductsPrices();
    })
    .then(() => {
      console.log('Product prices updated!');
    });
};

module.exports = checkTransactionsStatus;

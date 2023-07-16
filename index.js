require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { CronJob } = require('cron');
const UserRouter = require('./routes/User.router');
const ProductRouter = require('./routes/Product.router');
const checkTransaction = require('./cron-jobs/check-transactions.job');
const WebSocket = require('ws');

const PORT = process.env.PORT || 10000;

const app = express();

app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use('/api/user', UserRouter);
app.use('/api/products', ProductRouter);

const start = async () => {
  await mongoose.connect(process.env.MONGO_DB_LINK).then(() => {
    console.log('Successfully connected!');

    app.listen(PORT, () => {
      console.log('Server start successfully!');
    });
  });
};

start().then(() => {
  console.log('Success started!');

  const WSS_PORT = process.env.WEBSOCKET_PORT || 10001;
  const wss = new WebSocket.Server({ port: WSS_PORT });

  wss.on('connection', (wsClient) => {
    console.log('New user connected!');
  });

  const sendRefreshProducts = () => {
    const message = 'UPDATE_PRODUCTS';

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });

    console.log('Messages sent to all users!');
  };

  const checkTransactionJob = new CronJob('*/20 * * * *', () =>
    checkTransaction(sendRefreshProducts)
  );
  checkTransactionJob.start();
});

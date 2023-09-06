require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('cron')
const cors = require('cors');
const UserRouter = require('./routes/User.router');
const ProductRouter = require('./routes/Product.router');
const checkTransactionsStatus = require('./cron-jobs/check-transactions.job')

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

return start().then(() => {
  console.log('Success started!');
  const checkTransactionsStatusCron = new cron.CronJob('*/5 * * * *', checkTransactionsStatus)
  checkTransactionsStatusCron.start()
});

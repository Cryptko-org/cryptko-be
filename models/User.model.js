const { Schema, model } = require('mongoose');

const UserModel = new Schema({
  walletAddress: {
    type: String,
    required: true,
  },
  boughtProducts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'order',
    },
  ],
});

module.exports = model('user', UserModel);

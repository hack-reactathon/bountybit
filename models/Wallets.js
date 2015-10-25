var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var walletSchema = new Schema({
  guid: {type: String, default: ''},
  address: {type: String, default: ''},
  link: {type: String, default: ''},
  ownerType: {type: String, enum: {
    values: ['user', 'bounty']
    }
  },
  bountyWalletPassword: { type: String },
  _bountyOwner: { type: Number, ref: 'Bounty' },
  _userOwner: { type: Number, ref: 'User' }
});



module.exports = mongoose.model('Wallet', walletSchema);

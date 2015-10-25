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
  password: { type: String },
  _bountyOwner: { type: Number, ref: 'Bounty' },
  _userOwner: { type: Number, ref: 'User' }
});

/* Validate Password against User enter password when a bounty is created */
walletSchema.methods.compareBountyPassword = function(candidatePassword, cb) {
  console.log(this.password);
  console.log(candidatePassword);
  if (candidatePassword === this.password) {
    return cb({passed: true});
  } else {
    return cb({passed: false});
  }
};


module.exports = mongoose.model('Wallet', walletSchema);

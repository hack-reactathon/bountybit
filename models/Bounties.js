var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bountySchema = new Schema({
  total: Number,
  wallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
  _owner: { type: Number, ref: 'User' }
});



module.exports = mongoose.model('Bounty', bountySchema);

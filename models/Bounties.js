var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bountySchema = new Schema({
  issueUrl: String,
  total: Number,
  solved: { type: Boolean, default: false },
  wallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
  _owner: { type: Number, ref: 'User' }
});



module.exports = mongoose.model('Bounty', bountySchema);

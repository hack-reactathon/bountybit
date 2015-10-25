var async = require('async');
var request = require('request');
var _ = require('lodash');
var secrets = require('../config/secrets');
var Wallet = require('../models/Wallets');
var User = require('../models/User');
var Bounty = require('../models/Bounties');

/**
 * GET /createwallet
 * Create wallet form.
 */
exports.createWallet = function(req, res, next) {
  res.render('wallet/new', {
    title: 'Create Wallet'
  });
};

exports.postWallet = function(req, res, next) {

  var options = {
    url: 'https://blockchain.info/api/v2/create_wallet',
    method: 'POST',
    form: {
      password: req.bountyPW || req.body.password,
      api_code: 'f1161a96-5e74-48ea-94b9-d0ff72247533'
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  request(options, function(error, response, body) {
    if (error) {
      console.error(error);
      return res.render('500', {
        error: 'Error placing bounty'
      });
    }
    if (response.statusCode !== 200) {
      res.json(response);
    }

    // Add new wallet address to request for future transaction.

    if(!error && response.statusCode == 200) {
      var data = JSON.parse(body);
      // console.log("DATA", data);
      req.transaction = req.transaction || {};
      req.transaction.to = data.address;
      var wallet = new Wallet({
        guid: data.guid,
        address: data.address,
        link: data.link,
        ownerType: req.ownerType || 'user',
        password: req.bountyPW || req.body.password
      });
      wallet.save(function(err, saved) {
        if (err) {
          console.error(err);
          return res.render('500', {
            error: 'Error Saving Wallet'
          });
        }

        req.walletID = saved.id;
        next();

      });
    }
  });
};

exports.getAllWalletBalances = function(req, res) {
  var walletsArray = [];
  var requestArray = [];
  Wallet.find({}, function(err, wallets) {
    wallets.forEach(function(wallet) {
      var options = {
        url: "https://blockchain.info/merchant/" + wallet.guid + "/balance?password=dogjumpedovermoon&api_code=" + secrets.api_code,
        method: 'GET'
      };
      requestArray.push(function() {
        request(options, function(err, response, body) {
          if (err) console.log(err);
          console.log(body);
          return wallet.guid + ' - ' + body;
        });
      });
    });
    async.parallel(requestArray, function(result) {
      console.log(result);
      res.send(result);
    });
  });
};

exports.getWallets = function(req, res) {
  var walletsArray = [];
  var requestArray = [];
  Wallet.find({}, function(err, wallets) {
    wallets.forEach(function(wallet) {
      var options = {
        url: "https://blockchain.info/merchant/" + wallet.guid + "/balance?password=dogjumpedovermoon&api_code=" + secrets.api_code,
        method: 'GET'
      };
      requestArray.push(function(callback) {
        request(options, function(err, response, body) {
          if (err) console.log(err);
          body = JSON.parse(body);
          body.address = wallet.address;
          body.guid = wallet.guid;
          callback(null, body);
        });
      });
    });
    async.parallel(requestArray, function(err, results) {
      console.log(results);
      res.locals.wallets = results;
      res.render('wallet/show', {
        title: 'All Wallets'
      });
    });
  });
};

exports.getWalletBalance = function(req, res) {
  console.log(req.query);
  var options = {
    url: "https://blockchain.info/merchant/" + req.query.guid + "/balance?password=" + req.query.password + "&api_code=" + req.query.api_code,
    method: 'GET'
  };
  request(options, function(err, response, body) {
    console.log("Got from getWalletBalance: ", body);
    res.send(body);
  });
};

exports.connectWalletToUser = function(req, res) {
  Wallet.findById(req.walletID).exec(function(err, wallet) {
    User.findByIdAndUpdate(req.user.id, {
      wallet: wallet
    }, function(err, user) {
      if (err) {
        console.error('error updating user');
        return res.render('500', {
          error: 'Error updating user'
        });
      }

      wallet._userOwner = user;
      wallet.save(function(err, saved) {
        if (err) {
          console.error(err);
          return res.render('500', {
            error: 'Error associating user to wallet'
          });
        }
        console.log('saved it all');
        res.json(saved);
      });
    });
  });
};

exports.connectWalletToBounty = function(req, res, next) {
  Wallet.findById(req.walletID).exec(function(err, wallet) {
    Bounty.findByIdAndUpdate(req.bountyID, {
      wallet: wallet
    }, function(err, bounty) {
      if (err) {
        console.error(err);
        return res.render('500', {
          error: 'Error updating bounty'
        });
      }

      wallet._bountyOwner = bounty;
      wallet.save(function(err, saved) {
        if (err) {
          console.error(err);
          return res.render('500', {
            error: 'Error making bounty to wallet association'
          });
        }
        console.log('saved it all');
        next();
      });
    });
  });
};

exports.getUserWallet = function(walletID, cb) {
  Wallet.findById(walletID).exec(function(err, wallet) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, wallet);
    }
  });
};

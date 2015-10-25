var request = require('request');
var _ = require('lodash');
var Bounty = require('../models/Bounties');
var User = require('../models/User');
var rk = require('random-key');



exports.newBounty = function(req, res) {
  res.render('bounty/new', {
    title: 'Create a new bounty'
  });
};

exports.postBounty = function(req, res, next) {
  // res.json(req.body);
  // req.body.bountyAmount;
  // req.body.bountyUrl
  //
  //
  // var token = _.find(req.user.tokens, { kind: 'github' });
  //
  // var options = {
  //   method: "POST",
  //   url: "https://api.github.com/michael/github/issues/247",
  //   headers: {
  //     "Authorization": "token " + token.accessToken,
  //     "User-Agent": "Backer Test"
  //   },
  //   form: {
  //     body: "Arrrr, bounty fer " + req.body.bountyAmount,
  //   }
  // };
  //
  // request(options, function(err, response, body) {
  //   if (err) {
  //     return console.err(err);
  //   } else {
  //     console.log(body);
  //     res.end('Comment made and bounty set');
  //   }
  // });


  User.findById(req.user.id).exec(function(err, user) {
    if (err) {
      return console.err('error finding user: ', err);
    }

    req.bountyPassword = rk.generate(20);

    User.findById(req.user.id).populate('wallet').exec(function(err, user) {
      if (err || !user.wallet) {
        return console.error('Could not find wallet, or perhaps an error ', err);
      }
      user.wallet.compareBountyPassword(req.body.password, function(result) {
        console.log(result);
        if (!result.passed) {
          return res.json('invalid password');
        }
        var bounty = new Bounty({
          total: req.body.bountyAmount,
          issueUrl: req.body.bountyUrl
        });

        bounty.save(function(err, savedBounty) {
          user.bounties.push(savedBounty);
          user.save(function(err, savedUser) {
            savedBounty._owner = savedUser;
            savedBounty.save(function(err, saved) {
              console.log('saved bounty');
              console.log(saved);
              req.bountyID = saved._id;
              next();
            });
          });
        });
      });
    });
  });



};

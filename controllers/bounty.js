var request = require('request');
var _ = require('lodash');
var Bounty = require('../models/Bounties');
var User = require('../models/User');
var rk = require('random-key');
var url = require('url');


exports.newBounty = function(req, res) {
  res.render('bounty/new', {
    title: 'New Bounty'
  });
};

exports.getAll = function(req, res) {
  console.log(req.params);
  User.findOne({email: req.params.user}, function(err, user){
    res.json(user.bounties);
  });
};

exports.fetchList = function(req, res, next) {
  Bounty.find().populate('_owner', 'username').populate('wallet', 'address').exec(function(err, bounties) {
    console.log("successful");
    res.locals.bounties = bounties;
    next();
  });
};

exports.displayList = function(req, res) {
  res.render('bounty/show', {
    title: 'All Bounties'
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
      return res.render('500', {
        error: 'Error finding user'
      });
    }

    User.findById(req.user.id).populate('wallet').exec(function(err, user) {
      if (err || !user.wallet) {
        return res.render('500', {
          error: 'Error finding Wallet'
        });
      }


      req.transaction = {
        guid: user.wallet.guid,
        password: req.body.password,
        amount: req.body.bountyAmount,
        api_code: 'f1161a96-5e74-48ea-94b9-d0ff72247533'
      };


      user.wallet.compareBountyPassword(req.body.password, function(result) {
        if (!result.passed) {
          return res.render('403', {
            error: 'Invalid password'
          });
        }
        var bounty = new Bounty({
          total: req.body.bountyAmount,
          issueUrl: req.body.bountyUrl,
          _owner: user
        });

        bounty.save(function(err, savedBounty) {
          user.bounties.push(savedBounty);
          user.save(function(err, savedUser) {
            req.bountyID = savedBounty._id;
            req.ownerType = "bounty";
            req.bountyPW = rk.generate(20);
            var parseURL = url.parse(req.body.bountyUrl);
            var options = {
              uri: 'https://api.github.com/repos' + parseURL.pathname + '/comments',
              headers: {
                'Authorization': 'token 639118b8ff4e9abced81312761103194cb1bcc8c',
                'User-Agent': 'BountyHub-bot'
              },
              body: {'body': user.email + ' has placed a bounty worth ' + req.body.bountyAmount + ' m฿ on this issue.'},
              json: true
            };
            console.log('https://api.github.com/repos' + parseURL.pathname + '/comments');
            request.post(options, function(err,response,body){
              if(err) {
                console.log('error: ', err);

              }
              console.log(body);
              next();
            });
          });
        });
      });
    });
  });
};

var request = require('request');
var _ = require('lodash');



exports.newBounty = function(req, res) {
  res.render('bounty/new', {
    title: 'Create a new bounty'
  });
};

exports.postBounty = function(req, res, next) {
  // res.json(req.body);
  // req.body.bountyAmount;
  // req.body.bountyUrl


  var token = _.find(req.user.tokens, { kind: 'github' });

  var options = {
    method: "POST",
    url: "https://api.github.com/michael/github/issues/247",
    headers: {
      "Authorization": "token " + token.accessToken,
      "User-Agent": "Backer Test"
    },
    form: {
      body: "Arrrr, bounty fer " + req.body.bountyAmount,
    }
  };

  request(options, function(err, response, body) {
    if (err) {
      return console.err(err);
    } else {
      console.log(body);
      res.end('Comment made and bounty set');
    }
  });



};

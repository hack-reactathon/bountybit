/**
 * Split into declaration and initialization for better performance.
 */
var Github;
var request;


var _ = require('lodash');
var async = require('async');
var request = require('request');

var secrets;
if (process.env.environment === 'PROD') {
  secrets = require('../config/secrets_prod');
} else {
  secrets = require('../config/secrets');
}
/**
 * GET /api
 * List of API examples.
 */
exports.getApi = function(req, res) {
  res.render('api/index', {
    title: 'API Examples'
  });
};

exports.sendBitcoin = function(req,res) {
  console.log("Sending Bitcoin to Wallet");
  console.log("guid: ", req.transaction.guid);
  console.log("password: ", req.transaction.password);
  console.log("api_code: ", req.transaction.api_code);
  console.log("to: ", req.transaction.to);
  console.log("amount: ", req.transaction.amount);
  var options = {
    url: "https://blockchain.info/hi/merchant/" + req.transaction.guid + "/payment?password=" + req.transaction.password + "&api_code=" + req.transaction.api_code + "&amount=" + req.transaction.amount + "&to=" + req.transaction.to,
    method: 'GET'
  };
  request(options, function(err, response, body) {
    console.log("Sent: ", body);
    req.flash('success', { msg: 'Bounty has been placed!' });
    res.redirect('/');
  });
};


/**
 * GET /api/github
 * GitHub API Example.
 */
exports.getGithub = function(req, res, next) {
  Github = require('github-api');

  var token = _.find(req.user.tokens, { kind: 'github' });
  var github = new Github({ token: token.accessToken });
  var repo = github.getRepo('sahat', 'requirejs-library');
  repo.show(function(err, repo) {
    if (err) return next(err);
    res.render('api/github', {
      title: 'GitHub API',
      repo: repo
    });
  });

};

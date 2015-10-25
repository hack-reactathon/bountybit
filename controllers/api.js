/**
 * Split into declaration and initialization for better performance.
 */
var Github;
var request;


var _ = require('lodash');
var async = require('async');
var querystring = require('querystring');


var secrets;
if (process.env.production === 'PROD') {
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

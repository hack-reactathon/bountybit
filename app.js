/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var favicon = require('serve-favicon');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var methodOverride = require('method-override');

var _ = require('lodash');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var sass = require('node-sass-middleware');


/**
 * Controllers (route handlers).
 */
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');
var bountyController = require('./controllers/bounty');
var walletController = require('./controllers/wallet');
/**
 * API keys and Passport configuration.
 */
var secrets;
console.log(process.env.environment);
if (process.env.environment === 'PROD') {
  secrets = require('./config/secrets_prod');
} else {
  secrets = require('./config/secrets');
}
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  debug: true,
  outputStyle: 'expanded'
}));
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca({
  csrf: true,
  xframe: 'SAMEORIGIN',
  xssProtection: true
}));
app.use(function(req, res, next) {
  if (req.user) {
    res.locals.user = req.user;
    walletController.getUserWallet(req.user.wallet, function(err, wallet) {
      if (err) {
        console.log(err);
      }
      res.locals.wallet = wallet;
      next();
    });
  } else {
    next();
  }
});
app.use(function(req, res, next) {
  if (/api/i.test(req.path)) req.session.returnTo = req.path;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


/**
 * Primary app routes.
 */
app.get('/wallet/new', passportConf.isAuthenticated, walletController.createWallet);
app.post('/wallet/new', passportConf.isAuthenticated, walletController.postWallet, walletController.connectWalletToUser);
app.get('/wallets', passportConf.isAuthenticated, walletController.getWallets);
app.get('/wallet/getWalletBalance', passportConf.isAuthenticated, walletController.getWalletBalance);
app.get('/wallet/getAllWalletBalances', passportConf.isAuthenticated, walletController.getAllWalletBalances);
app.get('/api/bounty/getAll/:user', passportConf.isAuthenticated, bountyController.getAll);
app.get('/bounty', bountyController.fetchList, bountyController.displayList);

app.get('/sendReword', passportConf.isAuthenticated, userController.sendReword);

app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
// app.get('/forgot', userController.getForgot);
// app.post('/forgot', userController.postForgot);
// app.get('/reset/:token', userController.getReset);
// app.post('/reset/:token', userController.postReset);
// app.get('/signup', userController.getSignup);
// app.post('/signup', userController.postSignup);
// app.get('/contact', contactController.getContact);
// app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
app.get('/bounty/new', passportConf.isAuthenticated, bountyController.newBounty);
app.post('/bounty/new', passportConf.isAuthenticated, bountyController.postBounty, walletController.postWallet, walletController.connectWalletToBounty, apiController.sendBitcoin);

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/github', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getGithub);

/**
 * OAuth authentication routes. (Sign in)
 */

app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});


/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;

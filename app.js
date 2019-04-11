var authConfig = require('./config/auth')
var express = require('express')
var passport = require('passport')
var bodyParser = require('body-parser')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var app = express();
app.set('view engine', 'hbs');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var session = require('express-session');

// app.use(logger('dev'));
// app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// app.use(express.static(__dirname + '/public'));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy(
  authConfig.google,
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

app.get('/', function(req, res) {
  res.render('index', {
    user: req.user
  });
});

app.get('/login', function(req, res) {
  res.render('login', {
    user: req.user
  });
});

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['openid', 'email', 'profile']
}));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/account');
  });

app.get('/account', ensureAuthenticated, function(req, res) {
  res.render('account', {
    user: req.user
  });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Listening...");
});


// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.emails[0].value=="ronniesong0809@gmail.com"){
    console.log("Welcome "+ req.user.displayName)
    console.log(req.user.emails[0].value)
    return next();
  }else{
    console.log("You are not admin")
    req.logout();
    res.redirect('/login');
  }
}

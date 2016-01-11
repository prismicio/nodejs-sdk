
/**
 * Module dependencies.
 */
var express = require('express'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    http = require('http'),
    path = require('path'),
    prismic = require('express-prismic').Prismic,
    configuration = require('./prismic-configuration').Configuration;

module.exports = function() {
  var app = express();

  // Prismic.io configuration
  prismic.init(configuration);

  // all environments
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(favicon("public/images/punch.png"));
  app.use(logger('dev'));
  app.use(bodyParser());
  app.use(methodOverride());
  app.use(cookieParser('1234'));
  app.use(session({secret: '1234', saveUninitialized: true, resave: true}));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(errorHandler());

  return app;
}();
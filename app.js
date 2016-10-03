/**
 * Module dependencies.
 */
var Prismic = require('prismic-nodejs');
var app = require('./config');
var PORT = app.get('port');
var PConfig = require('./prismic-configuration');

var DEFAULT_ENDPOINT = 'https://your-repo-name.prismic.io/api';

function handleError(err, req, res) {
  if (err.status == 404) {
    res.status(404).send("404 not found");
  } else {
    res.status(500).send("Error 500: " + err.message);
  }
}

app.listen(PORT, function() {
  console.log('Type the follow command in your browser to run your project : http://localhost:' + PORT);
});

/**
* initialize prismic context and api
*/
app.route('*').get(function(req, res, next) {
  res.locals.ctx = { // So we can use this information in the views
    endpoint: PConfig.apiEndpoint,
    linkResolver: PConfig.linkResolver
  };
  req.getApi = Prismic.api(PConfig.apiEndpoint, {
    accessToken: PConfig.accessToken || null,
    req: req
  });
  next();
});

/**
* fallback route with documentation to build your project with prismic
*/
app.get('/help', function(req, res) {
  res.render('help', {isConfigured : DEFAULT_ENDPOINT !== PConfig.apiEndpoint});
});

/**
* preconfigured prismic preview
*/
app.get('/preview', function(req, res) {
  req.getApi.then(function(api) {
    return Prismic.preview(api, configuration.linkResolver, req, res);
  }).catch(function(err) {
    handleError(err, req, res);
  });
});

/**
* catch all if any route matches and redirect to help
*/
app.get('*', function(req, res) {
  res.redirect('/help')
});

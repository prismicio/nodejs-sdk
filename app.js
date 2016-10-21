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
  console.log('Type the following URL in your browser to run your project : http://localhost:' + PORT);
});

/**
* initialize prismic context and api
*/
function api(req, res) {
  res.locals.ctx = { // So we can use this information in the views
    endpoint: PConfig.apiEndpoint,
    linkResolver: PConfig.linkResolver
  };
  return Prismic.api(PConfig.apiEndpoint, {
    accessToken: PConfig.accessToken,
    req: req
  });
}

// INSERT YOUR ROUTES HERE

app.route('/').get(function(req, res){
  res.render('index');
});


/**
* Prismic documentation to build your project with prismic
*/
app.get('/help', function(req, res) {
  res.render('help', {
    isConfigured : DEFAULT_ENDPOINT != PConfig.apiEndpoint,
    repoURL: PConfig.apiEndpoint.replace("/api", "")
  });
});

/**
* preconfigured prismic preview
*/
app.get('/preview', function(req, res) {
  api(req).then(function(api) {
    return Prismic.preview(api, configuration.linkResolver, req, res);
  }).catch(function(err) {
    handleError(err, req, res);
  });
});

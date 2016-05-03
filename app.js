
/**
 * Module dependencies.
 */
var prismic = require('prismic-nodejs');
var configuration = require('./prismic-configuration');
var app = require('./config');
var PORT = app.get('port');

// Returns a Promise
function api(req, res) {
  // So we can use this information in the views
  res.locals.ctx = {
    endpoint: configuration.apiEndpoint,
    linkResolver: configuration.linkResolver
  };
  return prismic.api(configuration.apiEndpoint, {
    accessToken: configuration.accessToken,
    req: req
  });
}

function handleError(err, req, res) {
  if (err.status == 404) {
    res.status(404).send("404 not found");
  } else {
    res.status(500).send("Error 500: " + err.message);
  }
}

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});

app.route('/').get(function(req, res) {
  api(req, res).then(function(api) {
    return api.getByUID('page', 'get-started');
  }).then(function(prismicdoc) {
    res.render('index-prismic', {
      prismicdoc: prismicdoc
    });
  }).catch(function(err) {
    handleError(err, req, res);
  });
});

app.route('/preview').get(prismic.preview);


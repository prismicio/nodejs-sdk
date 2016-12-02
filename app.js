/**
 * Module dependencies.
 */
var Prismic = require('prismic-nodejs');
var app = require('./config');
var PORT = app.get('port');
var PConfig = require('./prismic-configuration');
var request = require('request');

app.listen(PORT, function() {
  const repoEndpoint = PConfig.apiEndpoint.replace('/api', '');
  request.post(repoEndpoint + '/app/settings/onboarding/run', {});
  console.log('Point your browser to: http://localhost:' + PORT);
});

/**
* initialize prismic context and api in a middleware
*/
app.use((req, res, next) => {
  Prismic.api(PConfig.apiEndpoint,{accessToken: PConfig.accessToken, req: req})
    .then((api) => {
      req.prismic = {api: api};
      res.locals.ctx = {
        endpoint: PConfig.apiEndpoint,
        snipcartKey: PConfig.snipcartKey,
        linkResolver: PConfig.linkResolver
      };
      next();
    }).catch(function(err) {
      console.error('missing Prismic API Configuration')
      next();
    });
});

// INSERT YOUR ROUTES HERE

/**
* route with documentation to build your project with prismic
*/
app.get('/', function(req, res) {
  res.redirect('/help');
});

/**
* Prismic documentation to build your project with prismic
*/
app.get('/help', function(req, res) {
  const repoRegexp = new RegExp('^(https?:\/\/([\\-\\w]+)\\.[a-z]+\\.(io|dev))\/api$');
  const match = PConfig.apiEndpoint.match(repoRegexp);
  const repoURL = match[1];
  const name = match[2];
  const host = req.headers.host;
  const isConfigured = name !== 'your-repo-name';
  res.render('help', {isConfigured, repoURL, name, host});
});

/**
* preconfigured prismic preview
*/
app.get('/preview', function(req, res) {
  return Prismic.preview(req.prismic.api, PConfig.linkResolver, req, res);
});

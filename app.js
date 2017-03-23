/**
 * Module dependencies.
 */
const Prismic = require('prismic-nodejs');
const request = require('request');
const PrismicConfig = require('./prismic-configuration');
const app = require('./config');

const PORT = app.get('port');

function handleError(err, req, res) {
  if (err.status === 404) {
    res.status(404).send('404 not found');
  } else {
    res.status(500).send(`Error 500: ${err.message}`);
  }
}

app.listen(PORT, () => {
  const endpoint = PrismicConfig.apiEndpoint.replace('/api', '');
  request.post(`${endpoint}/app/settings/onboarding/run`, { form: { language: 'node', framework: 'express' } });
  process.stdout.write(`Point your browser to: http://localhost: ${PORT}\n`);
});

/**
* initialize prismic context and api
*/
function fetchApi(req, res) {
  // So we can use this information in the views
  res.locals.ctx = { // eslint-disable-line no-param-reassign
    endpoint: PrismicConfig.apiEndpoint,
    linkResolver: PrismicConfig.linkResolver,
  };
  return Prismic.api(PrismicConfig.apiEndpoint, {
    accessToken: PrismicConfig.accessToken,
    req,
  });
}

// INSERT YOUR ROUTES HERE

/**
* route with documentation to build your project with prismic
*/
app.get('/', (req, res) => {
  res.redirect('/help');
});

/**
* Prismic documentation to build your project with prismic
*/
app.get('/help', (req, res) => {
  const repoRegexp = new RegExp('^(https?://([\\-\\w]+)\\.[a-z]+\\.(io|dev))/api$');
  const match = PrismicConfig.apiEndpoint.match(repoRegexp);
  const repoURL = match[1];
  const name = match[2];
  const host = req.headers.host;
  const isConfigured = name !== 'your-repo-name';
  res.render('help', { isConfigured, repoURL, name, host });
});

/**
* preconfigured prismic preview
*/
app.get('/preview', (req, res) => {
  fetchApi(req, res).then(api => (
    Prismic.preview(api, PrismicConfig.linkResolver, req, res)
  )).catch((err) => {
    handleError(err, req, res);
  });
});

const Prismic = require('prismic-nodejs');
const request = require('request');
const PrismicConfig = require('./prismic-configuration');
const Onboarding = require('./onboarding');
const app = require('./config');

const PORT = app.get('port');

app.listen(PORT, () => {
  Onboarding.trigger();
  process.stdout.write(`Point your browser to: http://localhost:${PORT}\n`);
});

/*
 * Initialize prismic context and api
 */
app.use((req, res, next) => {
  Prismic.api(PrismicConfig.apiEndpoint, { accessToken: PrismicConfig.accessToken, req })
  .then((api) => {
    req.prismic = { api };
    res.locals.ctx = {
      endpoint: PrismicConfig.apiEndpoint,
      linkResolver: PrismicConfig.linkResolver,
    };
    next();
  }).catch((err) => {
    const message = err.status === 404 ? 'There was a problem connecting to your API, please check your configuration file for errors.' : `Error 500: ${err.message}`;
    res.status(err.status).send(message);
  });
});

// INSERT YOUR ROUTES HERE
app.get('/page/:uid', (req, res) => {
  // We store the param uid in a variable
  const uid = req.params.uid;
    // We are using the function to get a document by its uid
  req.prismic.api.getByUID('page', uid).then((pageContent) => {
    if (pageContent) {
      // pageContent is a document, or null if there is no match
      res.render('page', {
        // Where 'page' is the name of your pug template file (page.pug)
        pageContent,
      });
    } else {
      res.status(404).send('404 not found');
    }
  });
});

/*
 * Route with documentation to build your project with prismic
 */
app.route('/').get((req, res) => {
  res.render('index');
});

/*
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

/*
 * Preconfigured prismic preview
 */
app.get('/preview', (req, res) => {
  Prismic.preview(req.prismic.api, PrismicConfig.linkResolver, req, res);
});

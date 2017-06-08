const Prismic = require('prismic-nodejs');
const request = require('request');
const config = require('./prismic-configuration');
const Onboarding = require('./onboarding');
const app = require('./config');

const PORT = app.get('port');

app.listen(PORT, () => {
  Onboarding.trigger();
  process.stdout.write(`Point your browser to: http://localhost:${PORT}\n`);
});

//Middleware catch all request, query Prismic API and configure everything for it
app.use((req, res, next) => {
  //init prismic context
  res.locals.ctx = {
    endpoint: config.apiEndpoint,
    linkResolver: config.linkResolver
  };
  Prismic.api(config.apiEndpoint, {
    accessToken: config.accessToken,
    req
  })
  .then((api) => {
    req.prismic = { api };
    //continue spreading request
    next();
  })
  .catch((error) => {
    //next with params handle error natively in express
    next(error.message);
  });
});

// INSERT YOUR ROUTES HERE
/*
 * Route with documentation to build your project with prismic
 */
app.get('/', (req, res) => {
  res.redirect('/help');
});

/*
 * Prismic documentation to build your project with prismic
 */
app.get('/help', (req, res) => {
  const repoRegexp = new RegExp('^(https?://([\\-\\w]+)\\.[a-z]+\\.(io|dev))/api$');
  const match = config.apiEndpoint.match(repoRegexp);
  const repoURL = match[1];
  const name = match[2];
  const host = req.headers.host;
  const isConfigured = name !== 'your-repo-name';
  res.render('help', { isConfigured, repoURL, name, host });
});

/*
 * Preconfigured prismic preview
 */
//preview
app.get('/preview', (req, res) => {
  const token = req.query.token;
  if (token) {
    req.prismic.api.previewSession(token, config.linkResolver, '/')
    .then((url) => {
      const cookies = new Cookies(req, res);
      cookies.set(Prismic.previewCookie, token, { maxAge: 30 * 60 * 1000, path: '/', httpOnly: false });
      res.redirect(302, url);
    }).catch((err) => {
      res.status(500).send(`Error 500 in preview: ${err.message}`);
    });
  } else {
    res.send(400, 'Missing token from querystring');
  }
});

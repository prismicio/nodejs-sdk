var prismic = require('../prismic-helpers');

// -- Display all documents

exports.index = prismic.route(function(req, res, ctx) {
  var uid = 'get-started';
  prismic.getDocumentByUID(ctx, 'page', uid, function then(err, document) {
    if (err) {
      prismic.onPrismicError(err, req, res);
    } else {
      res.render('index-prismic', {
        document: document
      });
    }
  }, function notFound() {
    res.send(404, 'Missing document ' + uid);
  });
});

// -- Preview documents from the Writing Room

exports.preview = prismic.route(function(req, res, ctx) {
  var token = req.query['token'];

  if (token) {
    ctx.api.previewSession(token, ctx.linkResolver, '/', function(err, url) {
      res.cookie(prismic.previewCookie, token, { maxAge: 30 * 60 * 1000, path: '/', httpOnly: false });
      res.redirect(301, url);
    });
  } else {
    res.send(400, "Missing token from querystring");
  }
});

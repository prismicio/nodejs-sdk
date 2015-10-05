var Prismic = require('prismic.io').Prismic,
    Promise = require('promise'),
    Configuration = require('./prismic-configuration').Configuration,
    http = require('http'),
    https = require('https'),
    url = require('url'),
    querystring = require('querystring');

exports.previewCookie = Prismic.previewCookie;

// -- Exposing as a helper what to do in the event of an error (please edit prismic-configuration.js to change this)
exports.onPrismicError = Configuration.onPrismicError;

exports.getApiHome = function(accessToken, callback) {
  Prismic.Api(Configuration.apiEndpoint, callback, accessToken);
};

function prismicWithCTX(ctxPromise, req, res) {
  var self = {

    'getApiHome' : function(accessToken, callback) {
      ctxPromise.then(function(ctx){
        res.locals.ctx = ctx;
        Prismic.Api(Configuration.apiEndpoint, callback, accessToken);
      });
    },
    'getByUID' : function(type, uid, onThen , onNotFound) {
      self.query(['at','my.'+type+'.uid',uid],function(err, response){
        var document = response.results[0];
        if(err) {
          prismic.onPrismicError(err, req, res);
        } else {
          if(document) {
            onThen && onThen(document);
          } else {
            if(onNotFound){
              onNotFound();
            } else {
              res.send(404, 'Missing document ' + uid);
            }
          }
        }
      });
    },
    'getBookmark' : function(bookmark, callback) {
      ctxPromise.then(function(ctx){
        res.locals.ctx = ctx;
        var id = ctx.api.bookmarks[bookmark];
        if(id) {
          self.getDocument(ctx, id, undefined, callback);
        } else {
          callback();
        }
      });
    },
    'getByIDs' : function(ids, callback) {
      ctxPromise.then(function(ctx){
        res.locals.ctx = ctx;
        if(ids && ids.length) {
          ctx.api.forms('everything').ref(ctx.ref).query('[[:d = any(document.id, [' + ids.map(function(id) { return '"' + id + '"';}).join(',') + '])]]').submit(function(err, response) {
            callback(err, response.results);
          });
        } else {
          callback(null, []);
        }
      });
    },
    'getByID' : function(id, slug, onThen, onNewSlug, onNotFound) {
      ctxPromise.then(function(ctx){
        res.locals.ctx = ctx;
        ctx.api.forms('everything').ref(ctx.ref).query('[[:d = at(document.id, "' + id + '")]]').submit(function(err, response) {
          var results = response.results;
          var doc = results && results.length ? results[0] : undefined;
          if (err) onThen(err);
          else if(doc && (!slug || doc.slug == slug)) onDone(null, doc);
          else if(doc && doc.slugs.indexOf(slug) > -1 && onNewSlug) onNewSlug(doc);
          else if(onNotFound) onNotFound();
          else onThen();
        });
      });
    },
    'query' : function(q, callback){
      ctxPromise.then(function(ctx){
        res.locals.ctx = ctx;
        ctx.api.forms('everything').ref(ctx.ref).query(q).submit(function(err, response) {
          callback(err, response);
        });
      });
    }
  };
  return self;
};

exports.withContext = function(req, res, callback) {
  var accessToken = (req.session && req.session['ACCESS_TOKEN']) || Configuration.accessToken;
  var ctxPromise = new Promise(function (fulfill) {

    exports.getApiHome(accessToken, function(err, Api) {
      if (err) {
          exports.onPrismicError(err, req, res);
          return;
      }
      var ctx = {
        endpoint: Configuration.apiEndpoint,
        api: Api,
        ref: req.cookies[Prismic.experimentCookie] || req.cookies[Prismic.previewCookie] || Api.master(),
        linkResolver: function(doc) {
          return Configuration.linkResolver(doc);
        }
      };
      fulfill(ctx);
    });

  });
  if(callback){
    res.locals.ctx = ctx;
    ctxPromise.then(callback);
  } else{
    return prismicWithCTX(ctxPromise, req, res);
  }
};

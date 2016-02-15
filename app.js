
/**
 * Module dependencies.
 */
var prismic = require('express-prismic');
var app = require('./config');
var PORT = app.get('port');

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

app.route('/').get(function(req, res){
  res.render('index');
});

app.route('/preview').get(prismic.preview);

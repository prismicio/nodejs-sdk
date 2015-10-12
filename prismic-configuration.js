exports.Configuration = {

  apiEndpoint: 'https://your-repo-name.prismic.io/api',

  // -- Access token if the Master is not open
  // accessToken: 'xxxxxx',

  // OAuth
  // clientId: 'xxxxxx',
  // clientSecret: 'xxxxxx',

  // -- Links resolution rules
  linkResolver: function(doc, ctx) {
    return false;
  }
 
};
